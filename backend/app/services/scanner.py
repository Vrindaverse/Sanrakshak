import asyncio
import hashlib
import subprocess
import json
import re
import socket
import ipaddress
import logging
from urllib.parse import urlparse

from app.logging import get_logger

logger = get_logger("sanrakshak.scanner")


_INTERNAL_TLDS = (".localhost", ".local", ".internal", ".invalid", ".test", ".example")


def _is_private_ip(ip) -> bool:
    return (
        ip.is_private or ip.is_loopback or ip.is_link_local
        or ip.is_reserved or ip.is_multicast or ip.is_unspecified
    )


def _parse_ip_literal(host: str):
    """Resolve IP literals incl. decimal (2130706433), hex (0x7f000001), octal, dotted-short (127.1)."""
    try:
        return ipaddress.ip_address(host)
    except ValueError:
        pass
    if host.isdigit():
        try:
            return ipaddress.ip_address(int(host))
        except ValueError:
            pass
    for base, prefix in ((16, "0x"), (8, "0o")):
        if host.lower().startswith(prefix):
            try:
                return ipaddress.ip_address(int(host, base))
            except ValueError:
                pass
    return None


def _resolve_host_sync(hostname: str):
    infos = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
    return [info[4][0] for info in infos]


async def _resolve_host(hostname: str):
    loop = asyncio.get_running_loop()
    infos = await loop.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
    return [info[4][0] for info in infos]


def _strip_proto(target: str) -> str:
    t = target.strip()
    if "://" in t:
        t = t.split("://", 1)[1]
    t = t.split("/", 1)[0].split("?", 1)[0].split("#", 1)[0]
    return t


def _validate_target(target: str) -> str:
    """Validate and normalize target to prevent command injection/SSRF."""
    if not target or not isinstance(target, str):
        raise ValueError("Invalid target")
    t = target.strip()
    if any(ord(c) < 32 or ord(c) == 127 for c in t):
        raise ValueError("Invalid target")
    if re.search(r'[;&|`$()<>"]', t):
        raise ValueError("Invalid target")
    parsed = urlparse(t if "://" in t else "http://" + t)
    host = parsed.hostname
    if not host:
        raise ValueError("Invalid target")
    host = host.lower()

    if host == "localhost" or host.endswith(".localhost"):
        raise ValueError("Invalid target")
    if any(host.endswith(suffix) for suffix in _INTERNAL_TLDS):
        raise ValueError("Invalid target")
    if "." not in host:
        raise ValueError("Invalid target")

    ip = _parse_ip_literal(host)
    if ip is not None:
        if _is_private_ip(ip):
            raise ValueError("Invalid target")
        scheme = parsed.scheme if parsed.scheme in ("http", "https") else ("https" if t.startswith("https") else "http")
        port = f":{parsed.port}" if parsed.port else ""
        return f"{scheme}://{host}{port}"

    if not re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$', host):
        raise ValueError("Invalid target")

    try:
        resolved = _resolve_host_sync(host)
    except (socket.gaierror, OSError):
        raise ValueError("Invalid target")
    for addr in resolved:
        try:
            resolved_ip = ipaddress.ip_address(addr)
        except ValueError:
            continue
        if _is_private_ip(resolved_ip):
            raise ValueError("Invalid target")

    scheme = parsed.scheme if parsed.scheme in ("http", "https") else ("https" if t.startswith("https") else "http")
    port = f":{parsed.port}" if parsed.port else ""
    return f"{scheme}://{host}{port}"


_ACTIVE_PROCESSES: dict[str, list[subprocess.Popen]] = {}


def _register_process(scan_id: str, proc: subprocess.Popen) -> None:
    _ACTIVE_PROCESSES.setdefault(scan_id, []).append(proc)


def _unregister_process(scan_id: str, proc: subprocess.Popen) -> None:
    try:
        _ACTIVE_PROCESSES.get(scan_id, []).remove(proc)
    except (ValueError, AttributeError):
        pass


def terminate_scan(scan_id: str) -> None:
    """Terminate all subprocesses still running for a scan (used on timeout/cancel)."""
    for proc in list(_ACTIVE_PROCESSES.get(scan_id, [])):
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
    _ACTIVE_PROCESSES.pop(scan_id, None)


def _run_cmd(cmd: list[str], timeout: int, scan_id: str | None = None):
    """Run a command, killing the subprocess on timeout."""
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if scan_id:
        _register_process(scan_id, proc)
    try:
        out, err = proc.communicate(timeout=timeout)
        return out or "", err or "", proc.returncode
    except subprocess.TimeoutExpired:
        logger.warning("Command timed out: %s", " ".join(cmd)[:80])
        proc.kill()
        out, err = proc.communicate()
        return out or "", err or "", -1
    finally:
        if scan_id:
            _unregister_process(scan_id, proc)


def run_nmap(scan_id: str, target: str) -> dict:
    try:
        validated = _validate_target(target)
    except Exception as e:
        return {
            "tool": "Nmap",
            "status": "error",
            "summary": "Invalid target",
            "raw": str(e),
            "interpretation": [{"finding": "Invalid target", "detail": "Target validation failed.", "severity": "info"}],
        }
    host = _strip_proto(validated)
    cmd = ["nmap", "-Pn", "-sV", "-sC", "-T4", "--min-rate", "500", host]
    try:
        out, err, rc = _run_cmd(cmd, timeout=300, scan_id=scan_id)
        raw = out or err
    except FileNotFoundError:
        logger.warning("Nmap not installed on server")
        return {
            "tool": "Nmap",
            "status": "not_installed",
            "summary": "Nmap not installed on server",
            "raw": "nmap not installed on server",
            "interpretation": [],
        }

    ports = re.findall(r"(\d+)/tcp\s+open\s+(\S+)", raw)
    findings = []
    for port, service in ports:
        port_num = int(port)
        if port_num == 22:
            severity = "high"
        elif port_num in (21, 23, 25, 110, 143):
            severity = "medium"
        else:
            severity = "low"
        findings.append({
            "finding": f"Port {port} ({service}) is open",
            "detail": f"Service {service} is running on port {port}.",
            "severity": severity,
        })

    status = "completed" if rc == 0 else "failed"
    return {
        "tool": "Nmap",
        "status": status,
        "summary": f"Scanned 1000 ports — {len(ports)} open",
        "raw": raw,
        "interpretation": findings or [{"finding": "No open ports detected", "detail": "All scanned ports are filtered or closed.", "severity": "info"}],
    }


def run_nikto(scan_id: str, target: str) -> dict:
    try:
        validated = _validate_target(target)
    except Exception as e:
        return {
            "tool": "Nikto",
            "status": "error",
            "summary": "Invalid target",
            "raw": str(e),
            "interpretation": [{"finding": "Invalid target", "detail": "Target validation failed.", "severity": "info"}],
        }
    parsed = urlparse(validated)
    host = parsed.hostname
    safe_name = hashlib.md5(validated.encode()).hexdigest()[:12]
    output_path = f"/tmp/nikto_{safe_name}_{scan_id[:8]}"
    is_https = parsed.scheme == "https"
    nikto_host = host
    nikto_port = parsed.port or (443 if is_https else 80)
    if is_https:
        cmd = ["nikto", "-h", nikto_host, "-port", str(nikto_port), "-ssl", "-Format", "txt", "-nointeractive", "-output", output_path]
    else:
        cmd = ["nikto", "-h", nikto_host, "-port", str(nikto_port), "-Format", "txt", "-nointeractive", "-output", output_path]
    try:
        out, err, rc = _run_cmd(cmd, timeout=300, scan_id=scan_id)
        raw = (out or "") + (err or "")
        try:
            with open(output_path) as f:
                raw = f.read()
        except FileNotFoundError:
            pass
    except FileNotFoundError:
        logger.warning("Nikto not installed on server")
        return {
            "tool": "Nikto",
            "status": "not_installed",
            "summary": "Nikto not installed on server",
            "raw": "nikto not installed on server",
            "interpretation": [],
        }

    issues = re.findall(r"^\+ (.+)$", raw, re.MULTILINE)
    findings = []
    for issue in issues[:10]:
        low = any(k in issue.lower() for k in ("x-", "cookie", "header"))
        findings.append({
            "finding": issue[:80],
            "detail": issue,
            "severity": "low" if low else "medium",
        })

    status = "completed" if rc == 0 else "failed"
    return {
        "tool": "Nikto",
        "status": status,
        "summary": f"Found {len(issues)} security issues",
        "raw": raw,
        "interpretation": findings or [{"finding": "No issues detected", "detail": "Nikto did not find any security issues.", "severity": "info"}],
    }


async def run_scanners(scan_id: str, target: str) -> list[dict]:
    # Validate once (off the event loop: DNS resolution is blocking)
    loop = asyncio.get_running_loop()
    try:
        validated = await loop.run_in_executor(None, _validate_target, target)
    except Exception as exc:
        logger.warning("Target validation failed for %s: %s", target, exc)
        return [{
            "tool": "Nmap",
            "status": "error",
            "summary": "Invalid target",
            "raw": "Target validation failed",
            "interpretation": [{"finding": "Invalid target", "detail": "Target validation failed.", "severity": "info"}],
        }]
    # Run nmap and nikto in parallel for faster results
    nmap_task = loop.run_in_executor(None, run_nmap, scan_id, validated)
    nikto_task = loop.run_in_executor(None, run_nikto, scan_id, validated)

    results = await asyncio.gather(nmap_task, nikto_task, return_exceptions=True)
    valid = []
    for r in results:
        if isinstance(r, dict):
            valid.append(r)
    return valid


def _recommendation_for(finding: str, source: str, severity: str) -> str:
    fl = finding.lower()
    if "open ports detected" in fl or "no alerts detected" in fl or "no issues detected" in fl:
        return "No action required."
    if "not installed" in fl:
        return f"Install {source or 'the scanner'} to enable its checks."
    if "port" in fl and "open" in fl:
        return "Close unused ports, restrict access to trusted IPs, and expose only required services."
    if "header" in fl:
        return "Add the missing security header and configure the server to send it on all responses."
    if "cookie" in fl:
        return "Set the Secure, HttpOnly, and SameSite flags on all session cookies."
    if "hsts" in fl:
        return "Enable HSTS with a sufficiently long max-age and include subdomains."
    if "server version" in fl or "version is visible" in fl or "apache" in fl or "nginx" in fl:
        return "Hide server version banners to reduce information disclosure."
    if "sql" in fl or "xss" in fl:
        return "Apply input validation, output encoding, and parameterized queries."
    return f"Review and remediate: {finding}"


def extract_vulnerabilities(tool_results: list[dict]) -> list[dict]:
    vulns = []
    seen = set()

    for tool in tool_results:
        status = tool.get("status")
        if status == "error":
            continue
        if status == "not_installed":
            title = f"{tool.get('tool', 'Scanner')} not installed"
            if title not in seen:
                seen.add(title)
                vulns.append({
                    "title": title,
                    "severity": "info",
                    "description": f"{tool.get('tool', 'Scanner')} is not installed on the server, so coverage for this tool is incomplete.",
                    "recommendation": f"Install {tool.get('tool', 'the scanner')} to enable its checks.",
                    "source": tool.get("tool", ""),
                })
            continue
        for item in tool.get("interpretation", []):
            title = item.get("finding", "")
            if not title or title == "No open ports detected" or title == "No issues detected" or title == "No alerts detected":
                continue
            if title in seen:
                continue
            seen.add(title)
            severity = str(item.get("severity", "low")).lower()
            if severity not in ("critical", "high", "medium", "low", "info"):
                severity = "low"
            vulns.append({
                "title": title,
                "severity": severity,
                "description": item.get("detail", ""),
                "recommendation": _recommendation_for(title, tool.get("tool", ""), severity),
                "source": tool.get("tool", ""),
            })
    return vulns


def calculate_score(vulnerabilities: list[dict]) -> int:
    weights = {"critical": 40, "high": 20, "medium": 8, "low": 2, "info": 0}
    total_deduction = sum(weights.get(v.get("severity", "low"), 2) for v in vulnerabilities)
    return max(0, min(100, 100 - total_deduction))

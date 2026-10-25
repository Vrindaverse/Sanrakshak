import asyncio
import hashlib
import subprocess
import json
import re


def _strip_proto(target: str) -> str:
    return target.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0]


def run_nmap(target: str) -> dict:
    host = _strip_proto(target)
    cmd = ["nmap", "-Pn", "-sV", "-sC", "-T4", "--min-rate", "500", host]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        raw = result.stdout or result.stderr
    except FileNotFoundError:
        return {
            "tool": "Nmap",
            "status": "not_installed",
            "summary": "Nmap not installed on server",
            "raw": "nmap not installed on server",
            "interpretation": [],
        }
    except subprocess.TimeoutExpired:
        raw = f"nmap timed out against {target}"
    except Exception as e:
        raw = str(e)

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

    return {
        "tool": "Nmap",
        "status": "completed",
        "summary": f"Scanned 1000 ports — {len(ports)} open",
        "raw": raw,
        "interpretation": findings or [{"finding": "No open ports detected", "detail": "All scanned ports are filtered or closed.", "severity": "info"}],
    }


def run_nikto(target: str) -> dict:
    host = _strip_proto(target)
    safe_name = hashlib.md5(target.encode()).hexdigest()[:12]
    output_path = f"/tmp/nikto_{safe_name}"
    if target.startswith("https://"):
        host = f"{host}:443"
    cmd = ["nikto", "-h", host, "-ssl", "-Format", "txt", "-nointeractive", "-output", output_path]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300, cwd="/tmp")
        raw = (result.stdout or "") + (result.stderr or "")
        try:
            with open(output_path) as f:
                raw = f.read()
        except FileNotFoundError:
            pass
    except FileNotFoundError:
        return {
            "tool": "Nikto",
            "status": "not_installed",
            "summary": "Nikto not installed on server",
            "raw": "nikto not installed on server",
            "interpretation": [],
        }
    except subprocess.TimeoutExpired:
        raw = f"nikto timed out against {target}"
        try:
            with open(output_path) as f:
                raw = f.read()
        except FileNotFoundError:
            pass
    except Exception as e:
        raw = str(e)

    issues = re.findall(r"^\+ (.+)$", raw, re.MULTILINE)
    findings = []
    for issue in issues[:10]:
        low = any(k in issue.lower() for k in ("x-", "cookie", "header"))
        findings.append({
            "finding": issue[:80],
            "detail": issue,
            "severity": "low" if low else "medium",
        })

    return {
        "tool": "Nikto",
        "status": "completed",
        "summary": f"Found {len(issues)} security issues",
        "raw": raw,
        "interpretation": findings or [{"finding": "No issues detected", "detail": "Nikto did not find any security issues.", "severity": "info"}],
    }


def run_zap(target: str) -> dict:
    safe_name = hashlib.md5(target.encode()).hexdigest()[:12]
    output_path = f"/tmp/zap_report_{safe_name}.json"
    cmd = ["zap-cli", "--quick", target, "--output", output_path]
    raw = ""
    alerts = []
    try:
        subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    except FileNotFoundError:
        return {
            "tool": "OWASP ZAP",
            "status": "not_installed",
            "summary": "ZAP not installed on server",
            "raw": "zap-cli not installed on server",
            "interpretation": [],
        }
    except subprocess.TimeoutExpired:
        raw = f"zap-cli timed out against {target}"
    except Exception as e:
        raw = str(e)

    if not raw:
        try:
            with open(output_path) as f:
                data = json.load(f)
            raw = json.dumps(data, indent=2)
            for site in data.get("site", []):
                alerts.extend(site.get("alerts", []))
        except FileNotFoundError:
            raw = "ZAP output file not found"
        except Exception as e:
            raw = str(e)

    severities = {"High": 0, "Medium": 0, "Low": 0}
    for a in alerts:
        s = a.get("risk", "")
        if s in severities:
            severities[s] += 1

    parts = [f"{v} {k.lower()}-risk" for k, v in severities.items() if v > 0]
    summary = ", ".join(parts) if parts else "No alerts"

    risk_map = {"High": "high", "Medium": "medium", "Low": "low"}

    return {
        "tool": "OWASP ZAP",
        "status": "completed",
        "summary": summary,
        "raw": raw,
        "interpretation": [
            {"finding": a.get("name", "Unknown"), "detail": a.get("description", ""), "severity": risk_map.get(a.get("risk", ""), "low")}
            for a in alerts[:10]
        ] or [{"finding": "No alerts detected", "detail": "ZAP did not find any vulnerabilities.", "severity": "info"}],
    }


async def run_scanners(target: str) -> list[dict]:
    loop = asyncio.get_running_loop()
    nmap_task = loop.run_in_executor(None, run_nmap, target)
    nikto_task = loop.run_in_executor(None, run_nikto, target)
    zap_task = loop.run_in_executor(None, run_zap, target)

    results = await asyncio.gather(nmap_task, nikto_task, zap_task, return_exceptions=True)
    valid = []
    for r in results:
        if isinstance(r, dict):
            valid.append(r)
    return valid


def extract_vulnerabilities(tool_results: list[dict]) -> list[dict]:
    vulns = []
    seen = set()

    for tool in tool_results:
        if tool.get("status") == "not_installed":
            continue
        for item in tool.get("interpretation", []):
            title = item.get("finding", "")
            if title in seen:
                continue
            seen.add(title)
            severity = item.get("severity", "low")
            if severity not in ("critical", "high", "medium", "low", "info"):
                severity = "low"
            vulns.append({
                "title": title,
                "severity": severity,
                "description": item.get("detail", ""),
                "recommendation": f"Review and fix: {title}",
                "source": tool.get("tool", ""),
            })
    return vulns


def calculate_score(vulnerabilities: list[dict]) -> int:
    weights = {"critical": 25, "high": 15, "medium": 8, "low": 3, "info": 0}
    total_deduction = sum(weights.get(v.get("severity", "low"), 3) for v in vulnerabilities)
    return max(0, min(100, 100 - total_deduction))

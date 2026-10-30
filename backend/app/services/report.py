import html
from app.models.scan import Scan, Vulnerability


def _e(value) -> str:
    return html.escape(str(value) if value is not None else "", quote=True)


def generate_html_report(scan: Scan, vulnerabilities: list[Vulnerability]) -> str:
    vuln_rows = "".join(
        f"""
        <div class="vuln">
            <div class="vuln-header">
                <strong>{_e(v.title)}</strong>
                <span class="severity {_e(v.severity)}">{_e(v.severity)}</span>
            </div>
            <p>{_e(v.description)}</p>
            {f'<p class="source">Source: {_e(v.source)}</p>' if v.source else ''}
            <div class="rec"><strong>Recommendation:</strong> {_e(v.recommendation)}</div>
        </div>"""
        for v in vulnerabilities
    )

    score_class = "good" if (scan.score or 0) >= 70 else "fair" if (scan.score or 0) >= 40 else "poor"

    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Security Report - {_e(scan.website)}</title>
<style>
    body {{ font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #222; background: #fafafa; }}
    h1 {{ font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 8px; }}
    .meta {{ color: #666; font-size: 14px; }}
    .score {{ font-size: 36px; font-weight: 700; }}
    .score.good {{ color: #000; }}
    .score.fair {{ color: #555; }}
    .score.poor {{ color: #888; }}
    .vuln {{ border: 1px solid #ddd; padding: 16px 20px; margin: 12px 0; border-left: 3px solid #000; background: #fff; }}
    .vuln-header {{ display: flex; justify-content: space-between; align-items: start; }}
    .severity {{ font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }}
    .severity.critical {{ background: #222; color: #fff; }}
    .severity.high {{ background: #444; color: #fff; }}
    .severity.medium {{ background: #888; color: #fff; }}
    .severity.low {{ background: #ccc; color: #000; }}
    .source {{ font-size: 12px; color: #999; margin: 4px 0; }}
    .rec {{ border-left: 3px solid #999; background: #f0f0f0; padding: 8px 12px; margin-top: 8px; font-size: 13px; }}
</style></head>
<body>
    <h1>Security Scan Report</h1>
    <p class="meta"><strong>Website:</strong> {_e(scan.website)}</p>
    <p class="meta"><strong>Date:</strong> {_e(scan.created_at.strftime('%B %d, %Y') if scan.created_at else '')}</p>
    <p class="score {score_class}">{scan.score or 'N/A'}/100</p>
    <h2>Vulnerabilities ({len(vulnerabilities)})</h2>
    {vuln_rows if vuln_rows else '<p>No vulnerabilities found.</p>'}
    {f'<h2>AI Summary</h2><div class="rec">{_e(scan.ai_summary)}</div>' if scan.ai_summary else ''}
</body>
</html>"""


def generate_markdown_report(scan: Scan, vulnerabilities: list[Vulnerability]) -> str:
    lines = [
        f"# Security Scan Report",
        f"",
        f"**Website:** {scan.website}",
        f"**Date:** {scan.created_at.strftime('%B %d, %Y')}",
        f"**Score:** {scan.score}/100",
        f"",
        f"## Vulnerabilities ({len(vulnerabilities)})",
        f"",
    ]

    for v in vulnerabilities:
        lines.extend([
            f"### [{v.severity.upper()}] {v.title}",
            f"",
            f"{v.description}",
            f"",
            f"> **Recommendation:** {v.recommendation}",
            f"",
        ])

    if scan.ai_summary:
        lines.extend([
            f"## AI Summary",
            f"",
            scan.ai_summary,
        ])

    return "\n".join(lines)

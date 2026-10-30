import asyncio
import logging
import google.genai as genai
from app.config import settings
from app.logging import get_logger

logger = get_logger("sanrakshak.ai")

SYSTEM_PROMPT = """You are a cybersecurity report writer. Given a list of vulnerabilities from a website scan, generate:
1. A short overall assessment (2-3 sentences)
2. Key findings organized by severity
3. Actionable recommendations

Keep the language clear and accessible for non-technical users. Use markdown formatting."""


async def generate_ai_summary(vulnerabilities: list[dict]) -> str:
    if not settings.gemini_api_key:
        logger.warning("GEMINI_API_KEY not configured; using fallback summary")
        return _fallback_summary(vulnerabilities)

    try:
        vuln_text = "\n".join(
            f"- [{v.get('severity', 'unknown').upper()}] {v.get('title', '')}: {v.get('description', '')}"
            for v in vulnerabilities
        )
        prompt = f"Vulnerabilities found:\n{vuln_text}\n\nProvide a security assessment summary."

        client = genai.Client(api_key=settings.gemini_api_key)
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config={
                    "system_instruction": SYSTEM_PROMPT,
                    "temperature": 0.3,
                    "max_output_tokens": 1024,
                },
            ),
        )
        return response.text or _fallback_summary(vulnerabilities)
    except Exception as exc:
        logger.exception("AI summary generation failed: %s", exc)
        return _fallback_summary(vulnerabilities)


def _fallback_summary(vulnerabilities: list[dict]) -> str:
    if not vulnerabilities:
        return "No vulnerabilities were detected during the scan."

    severities = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for v in vulnerabilities:
        s = v.get("severity", "low").lower()
        if s in severities:
            severities[s] += 1

    parts = [f"{v} {k}" for k, v in severities.items() if v > 0]
    severity_summary = ", ".join(parts)

    return (
        f"## Security Assessment Summary\n\n"
        f"The scan identified {len(vulnerabilities)} vulnerabilities ({severity_summary}). "
        f"Review each finding and apply the recommended fixes to improve your website's security posture.\n\n"
        f"### Recommendations\n\n"
        + "\n".join(f"- {v['title']}: {v.get('recommendation', 'Review this issue.')}" for v in vulnerabilities[:5])
    )

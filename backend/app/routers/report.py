import uuid
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.scan import Scan, Vulnerability

router = APIRouter(prefix="/api", tags=["report"])


@router.get("/report/{scan_id}", response_class=HTMLResponse)
async def get_report(
    scan_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.report import generate_html_report

    result = await db.execute(select(Scan).where(Scan.id == scan_id, Scan.user_id == user.id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    vuln_result = await db.execute(select(Vulnerability).where(Vulnerability.scan_id == scan_id))
    vulns = vuln_result.scalars().all()

    content = generate_html_report(scan, list(vulns))
    return HTMLResponse(content=content)


@router.get("/download/{scan_id}")
async def download_report(
    scan_id: uuid.UUID,
    fmt: Literal["html", "md"] = "md",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.report import generate_markdown_report, generate_html_report

    result = await db.execute(select(Scan).where(Scan.id == scan_id, Scan.user_id == user.id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    vuln_result = await db.execute(select(Vulnerability).where(Vulnerability.scan_id == scan_id))
    vulns = vuln_result.scalars().all()

    if fmt == "html":
        content = generate_html_report(scan, list(vulns))
        media_type = "text/html; charset=utf-8"
        filename = f"sanrakshak-report-{scan_id}.html"
    else:
        content = generate_markdown_report(scan, list(vulns))
        media_type = "text/markdown; charset=utf-8"
        filename = f"sanrakshak-report-{scan_id}.md"

    return Response(content=content, media_type=media_type, headers={"Content-Disposition": f'attachment; filename="{filename}"'})

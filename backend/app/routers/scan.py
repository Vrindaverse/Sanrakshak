import asyncio
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.scan import Scan, Vulnerability
from app.schemas.scan import ScanRequest, ScanResponse, ScanListItem, VulnerabilityResponse
from app.services.scanner import run_scanners, extract_vulnerabilities, calculate_score
from app.services.ai import generate_ai_summary

router = APIRouter(prefix="/api", tags=["scan"])


@router.post("/scan", response_model=ScanResponse, status_code=201)
async def create_scan(
    req: ScanRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    website = req.website.strip()
    if not website.startswith(("http://", "https://")):
        website = "https://" + website

    # Basic validation
    if len(website) > 500:
        raise HTTPException(status_code=400, detail="Invalid website")

    scan = Scan(user_id=user.id, website=website, status="running")
    db.add(scan)
    await db.commit()
    await db.refresh(scan)

    asyncio.create_task(execute_scan(scan.id, website))

    return ScanResponse(
        id=scan.id,
        website=scan.website,
        status=scan.status,
        score=scan.score,
        vulnerabilities=[],
        created_at=scan.created_at,
    )


async def execute_scan(scan_id: uuid.UUID, website: str):
    from app.database import async_session as session_factory

    try:
        await asyncio.wait_for(
            _do_scan(scan_id, website, session_factory),
            timeout=600,
        )
    except asyncio.TimeoutError:
        async with session_factory() as db:
            result = await db.execute(select(Scan).where(Scan.id == scan_id))
            scan = result.scalar_one_or_none()
            if scan:
                scan.status = "failed"
                await db.commit()


async def _do_scan(scan_id: uuid.UUID, website: str, session_factory):
    async with session_factory() as db:
        result = await db.execute(select(Scan).where(Scan.id == scan_id))
        scan = result.scalar_one_or_none()
        if not scan:
            return

        try:
            tool_results = await run_scanners(website)
            vulns = extract_vulnerabilities(tool_results)
            score = calculate_score(vulns)
            ai_summary = await generate_ai_summary(vulns)

            for v in vulns:
                vuln = Vulnerability(
                    scan_id=scan_id,
                    title=v["title"],
                    severity=v["severity"],
                    description=v["description"],
                    recommendation=v["recommendation"],
                    source=v.get("source"),
                )
                db.add(vuln)

            scan.status = "completed"
            scan.score = score
            scan.ai_summary = ai_summary
            scan.tool_results = tool_results
        except Exception:
            scan.status = "failed"

        await db.commit()


@router.get("/scan/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Scan).where(Scan.id == scan_id, Scan.user_id == user.id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    vuln_result = await db.execute(
        select(Vulnerability).where(Vulnerability.scan_id == scan_id)
    )
    vulns = vuln_result.scalars().all()

    return ScanResponse(
        id=scan.id,
        website=scan.website,
        status=scan.status,
        score=scan.score,
        ai_summary=scan.ai_summary,
        tool_results=scan.tool_results,
        vulnerabilities=[VulnerabilityResponse.model_validate(v) for v in vulns],
        created_at=scan.created_at,
    )


@router.get("/history", response_model=list[ScanListItem])
async def get_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Scan)
        .where(Scan.user_id == user.id)
        .order_by(desc(Scan.created_at))
        .limit(20)
    )
    scans = result.scalars().all()

    return [
        ScanListItem(id=s.id, website=s.website, status=s.status, score=s.score, created_at=s.created_at)
        for s in scans
    ]


@router.delete("/scan/{scan_id}", status_code=204)
async def delete_scan(
    scan_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Scan).where(Scan.id == scan_id, Scan.user_id == user.id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    await db.delete(scan)
    await db.commit()

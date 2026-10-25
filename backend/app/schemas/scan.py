import uuid
from datetime import datetime
from pydantic import BaseModel


class ScanRequest(BaseModel):
    website: str


class VulnerabilityResponse(BaseModel):
    id: uuid.UUID
    title: str
    severity: str
    description: str
    recommendation: str
    source: str | None = None

    class Config:
        from_attributes = True


class ScanResponse(BaseModel):
    id: uuid.UUID
    website: str
    status: str
    score: int | None = None
    ai_summary: str | None = None
    tool_results: list | None = None
    vulnerabilities: list[VulnerabilityResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ScanListItem(BaseModel):
    id: uuid.UUID
    website: str
    status: str
    score: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True

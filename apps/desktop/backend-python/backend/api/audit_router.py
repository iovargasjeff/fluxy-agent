import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.models import AuditLog, ReportArtifact
from backend.models.schemas import AuditLogRequest, AuditLogResponse, ReportArtifactResponse, ReportCreateRequest
from backend.reports.markdown import render_markdown_report

router = APIRouter(prefix="/audit", tags=["Audit"])


def serialize_audit(log: AuditLog) -> AuditLogResponse:
    return AuditLogResponse(
        id=log.id,
        agent=log.agent,
        skill_id=log.skill_id,
        connection_id=log.connection_id,
        action=log.action,
        result=log.result,
        backup_id=log.backup_id,
        sandbox_id=log.sandbox_id,
        human_approved=log.human_approved,
        details=json.loads(log.details_json or "{}"),
        created_at=log.created_at,
    )


def serialize_report(report: ReportArtifact) -> ReportArtifactResponse:
    return ReportArtifactResponse(
        id=report.id,
        title=report.title,
        artifact_type=report.artifact_type,
        content=report.content,
        audit_log_id=report.audit_log_id,
        created_at=report.created_at,
    )


@router.post("/logs", response_model=AuditLogResponse)
def create_audit_log(req: AuditLogRequest, db: Session = Depends(get_db)):
    log = AuditLog(
        agent=req.agent,
        skill_id=req.skill_id,
        connection_id=req.connection_id,
        action=req.action,
        result=req.result,
        backup_id=req.backup_id,
        sandbox_id=req.sandbox_id,
        human_approved=req.human_approved,
        details_json=json.dumps(req.details),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return serialize_audit(log)


@router.get("/logs", response_model=list[AuditLogResponse])
def list_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    return [serialize_audit(log) for log in logs]


@router.post("/reports", response_model=ReportArtifactResponse)
def create_report(req: ReportCreateRequest, db: Session = Depends(get_db)):
    content = render_markdown_report(req.title, req.summary, req.sections)
    report = ReportArtifact(
        title=req.title,
        artifact_type="markdown",
        content=content,
        audit_log_id=req.audit_log_id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return serialize_report(report)


@router.get("/reports", response_model=list[ReportArtifactResponse])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(ReportArtifact).order_by(ReportArtifact.created_at.desc()).all()
    return [serialize_report(report) for report in reports]


@router.get("/reports/{report_id}.md", response_class=PlainTextResponse)
def get_report_markdown(report_id: int, db: Session = Depends(get_db)):
    report = db.query(ReportArtifact).filter(ReportArtifact.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report.content

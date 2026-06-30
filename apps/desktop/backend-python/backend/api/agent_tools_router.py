import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.models import AgentMemory, ApprovalRequest, EnvironmentGuard, SchemaDecision, SkillPermission
from backend.models.schemas import (
    AgentMemoryRequest,
    AgentMemoryResponse,
    AgentToolsState,
    ApprovalRequestCreate,
    ApprovalRequestResponse,
    EnvironmentGuardRequest,
    EnvironmentGuardResponse,
    SchemaDecisionRequest,
    SchemaDecisionResponse,
    SkillPermissionRequest,
    SkillPermissionResponse,
)

router = APIRouter(prefix="/agent-tools", tags=["Agent Tools"])


def memory_response(item: AgentMemory) -> AgentMemoryResponse:
    return AgentMemoryResponse(
        id=item.id,
        scope=item.scope,
        subject=item.subject,
        content=item.content,
        tags=json.loads(item.tags_json or "[]"),
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


def permission_response(item: SkillPermission) -> SkillPermissionResponse:
    return SkillPermissionResponse(
        id=item.id,
        skill_id=item.skill_id,
        can_read_schema=item.can_read_schema,
        can_generate_sql=item.can_generate_sql,
        can_execute=item.can_execute,
        requires_approval=item.requires_approval,
        environment=item.environment,
        updated_at=item.updated_at,
    )


def approval_response(item: ApprovalRequest) -> ApprovalRequestResponse:
    return ApprovalRequestResponse(
        id=item.id,
        title=item.title,
        risk_level=item.risk_level,
        requested_by=item.requested_by,
        details=json.loads(item.details_json or "{}"),
        status=item.status,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


def decision_response(item: SchemaDecision) -> SchemaDecisionResponse:
    return SchemaDecisionResponse(
        id=item.id,
        project_id=item.project_id,
        title=item.title,
        decision=item.decision,
        rationale=item.rationale,
        status=item.status,
        created_at=item.created_at,
    )


def guard_response(item: EnvironmentGuard) -> EnvironmentGuardResponse:
    return EnvironmentGuardResponse(
        id=item.id,
        environment=item.environment,
        require_backup=item.require_backup,
        require_sandbox=item.require_sandbox,
        require_approval=item.require_approval,
        allow_direct_write=item.allow_direct_write,
        updated_at=item.updated_at,
    )


def seed_guards(db: Session):
    existing = {guard.environment for guard in db.query(EnvironmentGuard).all()}
    defaults = [
        EnvironmentGuard(environment="development", allow_direct_write=True),
        EnvironmentGuard(environment="staging", require_backup=True, require_sandbox=True, allow_direct_write=True),
        EnvironmentGuard(environment="production", require_backup=True, require_sandbox=True, require_approval=True, allow_direct_write=False),
    ]
    for guard in defaults:
        if guard.environment not in existing:
            db.add(guard)
    db.commit()


@router.get("", response_model=AgentToolsState)
def get_agent_tools_state(db: Session = Depends(get_db)):
    seed_guards(db)
    return AgentToolsState(
        memories=[memory_response(item) for item in db.query(AgentMemory).order_by(AgentMemory.updated_at.desc()).all()],
        skill_permissions=[permission_response(item) for item in db.query(SkillPermission).order_by(SkillPermission.updated_at.desc()).all()],
        approvals=[approval_response(item) for item in db.query(ApprovalRequest).order_by(ApprovalRequest.created_at.desc()).all()],
        decisions=[decision_response(item) for item in db.query(SchemaDecision).order_by(SchemaDecision.created_at.desc()).all()],
        environment_guards=[guard_response(item) for item in db.query(EnvironmentGuard).order_by(EnvironmentGuard.environment.asc()).all()],
    )


@router.post("/memories", response_model=AgentMemoryResponse)
def create_memory(req: AgentMemoryRequest, db: Session = Depends(get_db)):
    item = db.query(AgentMemory).filter(
        AgentMemory.scope == req.scope,
        AgentMemory.subject == req.subject,
    ).first()
    if not item:
        item = AgentMemory(scope=req.scope, subject=req.subject)
        db.add(item)
    item.content = req.content
    item.tags_json = json.dumps(req.tags)
    db.commit()
    db.refresh(item)
    return memory_response(item)


@router.post("/skill-permissions", response_model=SkillPermissionResponse)
def upsert_skill_permission(req: SkillPermissionRequest, db: Session = Depends(get_db)):
    item = db.query(SkillPermission).filter(
        SkillPermission.skill_id == req.skill_id,
        SkillPermission.environment == req.environment,
    ).first()
    if not item:
        item = SkillPermission(skill_id=req.skill_id, environment=req.environment)
        db.add(item)
    item.can_read_schema = req.can_read_schema
    item.can_generate_sql = req.can_generate_sql
    item.can_execute = req.can_execute
    item.requires_approval = req.requires_approval
    db.commit()
    db.refresh(item)
    return permission_response(item)


@router.post("/approvals", response_model=ApprovalRequestResponse)
def create_approval(req: ApprovalRequestCreate, db: Session = Depends(get_db)):
    item = ApprovalRequest(title=req.title, risk_level=req.risk_level, requested_by=req.requested_by, details_json=json.dumps(req.details))
    db.add(item)
    db.commit()
    db.refresh(item)
    return approval_response(item)


@router.patch("/approvals/{approval_id}/{status}", response_model=ApprovalRequestResponse)
def set_approval_status(approval_id: int, status: str, db: Session = Depends(get_db)):
    if status not in {"approved", "rejected", "pending"}:
        raise HTTPException(status_code=400, detail="Invalid approval status.")
    item = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Approval not found.")
    item.status = status
    db.commit()
    db.refresh(item)
    return approval_response(item)


@router.post("/decisions", response_model=SchemaDecisionResponse)
def create_decision(req: SchemaDecisionRequest, db: Session = Depends(get_db)):
    item = SchemaDecision(
        project_id=req.project_id,
        title=req.title,
        decision=req.decision,
        rationale=req.rationale,
        status=req.status,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return decision_response(item)


@router.post("/environment-guards", response_model=EnvironmentGuardResponse)
def upsert_environment_guard(req: EnvironmentGuardRequest, db: Session = Depends(get_db)):
    item = db.query(EnvironmentGuard).filter(EnvironmentGuard.environment == req.environment).first()
    if not item:
        item = EnvironmentGuard(environment=req.environment)
        db.add(item)
    item.require_backup = req.require_backup
    item.require_sandbox = req.require_sandbox
    item.require_approval = req.require_approval
    item.allow_direct_write = req.allow_direct_write
    db.commit()
    db.refresh(item)
    return guard_response(item)

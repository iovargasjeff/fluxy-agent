import json
import secrets
import urllib.error
import urllib.request
from urllib.parse import urlencode
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.core.database import get_db
from backend.core.encryption import decrypt_password, encrypt_password
from backend.models.models import CloudAccountSession, SyncQueueItem
from backend.models.schemas import SyncQueueRequest, SyncQueueResponse
from backend.sync.safe_payload import validate_safe_sync_payload
from diagrams.models import Diagram, Project

router = APIRouter(prefix="/sync", tags=["Sync"])
DEVICE_SESSIONS: dict[str, dict] = {}


class DeviceCompleteRequest(BaseModel):
    device_code: str
    user_email: str | None = None
    access_token: str


def cleanup_device_sessions():
    now = datetime.now(timezone.utc)
    expired = [code for code, session in DEVICE_SESSIONS.items() if session["expires_at"] < now]
    for code in expired:
        DEVICE_SESSIONS.pop(code, None)


def serialize_queue_item(item: SyncQueueItem) -> SyncQueueResponse:
    return SyncQueueResponse(
        id=item.id,
        artifact_type=item.artifact_type,
        local_id=item.local_id,
        operation=item.operation,
        status=item.status,
        attempts=item.attempts,
        last_error=item.last_error,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.post("/device/start")
def start_device_link(request: Request):
    cleanup_device_sessions()
    device_code = secrets.token_urlsafe(18)
    user_code = f"FLUXY-{secrets.randbelow(900000) + 100000}"
    local_port = request.url.port or 8000
    local_callback_url = f"http://127.0.0.1:{local_port}"
    DEVICE_SESSIONS[device_code] = {
        "user_code": user_code,
        "status": "pending",
        "user_email": None,
        "access_token": None,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    return {
        "device_code": device_code,
        "user_code": user_code,
        "status": "pending",
        "verification_url": "http://localhost:3000/desktop-link?" + urlencode({
            "device_code": device_code,
            "sidecar_url": local_callback_url,
        }),
        "expires_in": 600,
        "poll_interval": 2,
    }


@router.get("/device/status/{device_code}")
def device_link_status(device_code: str):
    cleanup_device_sessions()
    session = DEVICE_SESSIONS.get(device_code)
    if not session:
        raise HTTPException(status_code=404, detail="La solicitud de sincronizacion expiro o no existe.")
    return {
        "device_code": device_code,
        "user_code": session["user_code"],
        "status": session["status"],
        "user_email": session["user_email"],
        "expires_at": session["expires_at"].isoformat(),
    }


@router.post("/device/complete")
def complete_device_link(req: DeviceCompleteRequest, db: Session = Depends(get_db)):
    cleanup_device_sessions()
    session = DEVICE_SESSIONS.get(req.device_code)
    if not session:
        raise HTTPException(status_code=404, detail="La solicitud de sincronizacion expiro o no existe.")
    if not req.access_token:
        raise HTTPException(status_code=400, detail="Token de sesion requerido.")
    session["status"] = "linked"
    session["user_email"] = req.user_email or "usuario@fluxy.local"
    session["access_token"] = req.access_token
    session["token_source"] = "fluxy_web_session"

    account = db.query(CloudAccountSession).filter(CloudAccountSession.id == 1).first()
    if not account:
        account = CloudAccountSession(id=1, user_email=session["user_email"], access_token=encrypt_password(req.access_token))
        db.add(account)
    else:
        account.user_email = session["user_email"]
        account.access_token = encrypt_password(req.access_token)
        account.provider = "fluxy_web"
        account.status = "linked"
    db.commit()

    return {
        "ok": True,
        "status": "linked",
        "user_email": session["user_email"],
        "token_source": session["token_source"],
        "message": "Desktop enlazado con Fluxy Web.",
    }


@router.get("/account")
def get_cloud_account(db: Session = Depends(get_db)):
    account = db.query(CloudAccountSession).filter(CloudAccountSession.id == 1).first()
    if not account:
        return {"linked": False, "user_email": None, "provider": None, "status": "local"}
    return {
        "linked": account.status == "linked",
        "user_email": account.user_email,
        "provider": account.provider,
        "status": account.status,
        "linked_at": account.linked_at,
        "updated_at": account.updated_at,
    }


def _cloud_marker(cloud_id: str) -> str:
    return f"cloud_project_id:{cloud_id}"


@router.post("/cloud/pull")
def pull_cloud_projects(db: Session = Depends(get_db)):
    account = db.query(CloudAccountSession).filter(CloudAccountSession.id == 1).first()
    if not account or account.status != "linked":
        raise HTTPException(status_code=401, detail="Desktop no esta enlazado con Fluxy Web.")

    token = decrypt_password(account.access_token)
    request = urllib.request.Request(
        "http://localhost:3000/api/desktop-sync/projects",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8") or str(error)
        raise HTTPException(status_code=error.code, detail=f"Fluxy Web rechazo la sincronizacion: {detail}")
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"No se pudo conectar con Fluxy Web: {error}")

    projects_imported = 0
    diagrams_imported = 0
    for cloud_project in payload.get("projects", []):
        marker = _cloud_marker(cloud_project["id"])
        project = db.query(Project).filter(Project.description.like(f"%{marker}%")).first()
        description = cloud_project.get("description") or ""
        synced_description = f"{description}\n\n{marker}".strip()
        if not project:
            project = Project(name=cloud_project["name"], description=synced_description)
            db.add(project)
            db.flush()
            projects_imported += 1
        else:
            project.name = cloud_project["name"]
            project.description = synced_description

        for cloud_diagram in cloud_project.get("diagrams", []):
            diagram_marker = f"cloud_diagram_id:{cloud_diagram['id']}"
            diagram = db.query(Diagram).filter(
                Diagram.project_id == project.id,
                Diagram.source_database == diagram_marker,
            ).first()
            if not diagram:
                diagram = Diagram(project_id=project.id, source_database=diagram_marker)
                db.add(diagram)
                diagrams_imported += 1
            diagram.name = cloud_diagram.get("name") or "Diagrama Web"
            diagram.schema_json = json.dumps(cloud_diagram.get("flowJson") or {"nodes": [], "edges": []})
            diagram.sql_content = cloud_diagram.get("sourceCode") or ""
            diagram.active_dialect = cloud_diagram.get("dialect") or "postgresql"
            diagram.selected_tables_json = "[]"
            diagram.last_synced_at = datetime.utcnow()

    db.commit()
    return {
        "ok": True,
        "projects_imported": projects_imported,
        "diagrams_imported": diagrams_imported,
        "projects_seen": len(payload.get("projects", [])),
    }


@router.post("/queue", response_model=SyncQueueResponse)
def enqueue_sync(req: SyncQueueRequest, db: Session = Depends(get_db)):
    try:
        validate_safe_sync_payload(req.artifact_type, req.payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    item = SyncQueueItem(
        artifact_type=req.artifact_type,
        local_id=req.local_id,
        operation=req.operation,
        payload_json=json.dumps(req.payload),
        status="pending",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize_queue_item(item)


@router.get("/queue", response_model=list[SyncQueueResponse])
def list_sync_queue(status: str = "pending", db: Session = Depends(get_db)):
    items = db.query(SyncQueueItem).filter(SyncQueueItem.status == status).order_by(SyncQueueItem.created_at.asc()).all()
    return [serialize_queue_item(item) for item in items]


@router.post("/queue/{item_id}/mark-synced", response_model=SyncQueueResponse)
def mark_synced(item_id: int, db: Session = Depends(get_db)):
    item = db.query(SyncQueueItem).filter(SyncQueueItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Sync item not found.")
    item.status = "synced"
    db.commit()
    db.refresh(item)
    return serialize_queue_item(item)

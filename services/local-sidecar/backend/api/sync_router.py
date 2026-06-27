import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.models import SyncQueueItem
from backend.models.schemas import SyncQueueRequest, SyncQueueResponse
from backend.sync.safe_payload import validate_safe_sync_payload

router = APIRouter(prefix="/sync", tags=["Sync"])


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

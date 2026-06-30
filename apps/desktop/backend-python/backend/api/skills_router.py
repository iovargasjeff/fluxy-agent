from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.schemas import SkillInstallRequest, SkillMetadata, SkillResolveRequest, SkillRunRequest, SkillRunResponse, SkillToggleRequest
from backend.skills.registry import install_skill, list_skills, resolve_skills, set_skill_enabled
from backend.skills.runner import run_skill

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=list[SkillMetadata])
def get_skills(db: Session = Depends(get_db)):
    return list_skills(db)


@router.post("/install", response_model=SkillMetadata)
def install_fluxy_skill(req: SkillInstallRequest, db: Session = Depends(get_db)):
    skill = install_skill(db, req.skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")
    return skill


@router.patch("/{skill_id}/enabled", response_model=SkillMetadata)
def toggle_fluxy_skill(skill_id: str, req: SkillToggleRequest, db: Session = Depends(get_db)):
    skill = set_skill_enabled(db, skill_id, req.enabled)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")
    return skill


@router.post("/resolve", response_model=list[SkillMetadata])
def resolve_compatible_skills(req: SkillResolveRequest, db: Session = Depends(get_db)):
    return resolve_skills(req.profile, db)


@router.post("/run", response_model=SkillRunResponse)
def run_fluxy_skill(req: SkillRunRequest, db: Session = Depends(get_db)):
    return run_skill(req, db)

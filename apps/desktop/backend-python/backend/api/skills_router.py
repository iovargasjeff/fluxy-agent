from fastapi import APIRouter

from backend.models.schemas import SkillMetadata, SkillResolveRequest, SkillRunRequest, SkillRunResponse
from backend.skills.registry import list_skills, resolve_skills
from backend.skills.runner import run_skill

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=list[SkillMetadata])
def get_skills():
    return list_skills()


@router.post("/resolve", response_model=list[SkillMetadata])
def resolve_compatible_skills(req: SkillResolveRequest):
    return resolve_skills(req.profile)


@router.post("/run", response_model=SkillRunResponse)
def run_fluxy_skill(req: SkillRunRequest):
    return run_skill(req)

import uuid

from backend.models.schemas import Artifact, PolicyDecision, SkillRunRequest, SkillRunResponse
from backend.policy.engine import evaluate_policy
from backend.skills.registry import get_skill


def run_skill(request: SkillRunRequest) -> SkillRunResponse:
    skill = get_skill(request.skill_id)
    run_id = str(uuid.uuid4())

    if not skill:
        return SkillRunResponse(
            run_id=run_id,
            skill_id=request.skill_id,
            status="not_found",
            message="Skill is not installed.",
        )

    environment = request.profile.environment if request.profile else "unknown"
    if skill.requires_approval or skill.requires_backup or skill.requires_sandbox:
        policy = evaluate_policy(
            operation="alter" if "migration" in skill.id else "direct_insert",
            environment=environment,
            has_backup=False,
            has_sandbox=False,
            human_approved=request.human_approved,
        )
        if policy.decision != PolicyDecision.allow:
            return SkillRunResponse(
                run_id=run_id,
                skill_id=skill.id,
                status="requires_approval",
                message="Skill requires safety prerequisites before execution.",
                policy=policy,
            )

    artifact = Artifact(
        id=str(uuid.uuid4()),
        type="report",
        title=f"{skill.name} Report",
        content=(
            f"Skill `{skill.id}` accepted by Fluxy runner.\n\n"
            f"Instruction: {request.instruction or 'No instruction provided.'}\n"
            "This baseline runner records the workflow contract and produces a safe artifact."
        ),
    )
    return SkillRunResponse(
        run_id=run_id,
        skill_id=skill.id,
        status="completed",
        message="Skill completed with baseline artifact.",
        artifacts=[artifact],
    )

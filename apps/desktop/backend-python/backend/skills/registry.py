from sqlalchemy.orm import Session

from backend.models.models import LocalSkillInstallation
from backend.models.schemas import DatabaseProfile, SkillMetadata


OFFICIAL_SKILLS = [
    SkillMetadata(
        id="create_database",
        name="Create Database",
        description="Design a new database schema from a product brief or domain model.",
        category="design",
        engines=[],
        tags=["schema", "agent-skills"],
    ),
    SkillMetadata(
        id="review_database",
        name="Review Database",
        description="Inspect schema structure and produce safe improvement recommendations.",
        category="review",
        engines=[],
        risk_level="low",
        tags=["review", "quality"],
    ),
    SkillMetadata(
        id="generate_diagram",
        name="Generate Diagram",
        description="Create ER diagrams and documentation artifacts from database metadata.",
        category="diagram",
        engines=[],
        risk_level="low",
        tags=["diagram", "docs"],
    ),
    SkillMetadata(
        id="seed_data",
        name="Synthetic Data Seeder",
        description="Generate realistic synthetic records using domain presets and table rules.",
        category="synthetic-data",
        engines=[],
        risk_level="medium",
        tags=["seed", "faker"],
    ),
    SkillMetadata(
        id="export_documentation",
        name="Export Documentation",
        description="Export database summaries, table dictionaries and reports.",
        category="documentation",
        engines=[],
        tags=["docs", "reports"],
    ),
    SkillMetadata(
        id="safe_migration_basic",
        name="Safe Migration Basic",
        description="Plan guarded migrations with required backup, sandbox and human approval.",
        category="safety",
        engines=["postgresql"],
        risk_level="high",
        requires_approval=True,
        requires_backup=True,
        requires_sandbox=True,
        tags=["migration", "safety", "postgresql"],
    ),
    SkillMetadata(
        id="postgresql_inspect",
        name="PostgreSQL Inspect",
        description="Collect PostgreSQL schema, extension and configuration facts for analysis.",
        category="postgresql",
        engines=["postgresql"],
        tags=["postgresql", "inspect"],
    ),
    SkillMetadata(
        id="postgresql_backup",
        name="PostgreSQL Backup",
        description="Prepare a local PostgreSQL backup artifact before risky operations.",
        category="postgresql",
        engines=["postgresql"],
        risk_level="medium",
        tags=["postgresql", "backup"],
    ),
    SkillMetadata(
        id="postgresql_sandbox",
        name="PostgreSQL Sandbox",
        description="Create or describe a PostgreSQL sandbox target for migration rehearsal.",
        category="postgresql",
        engines=["postgresql"],
        risk_level="medium",
        tags=["postgresql", "sandbox"],
    ),
    SkillMetadata(
        id="postgresql_query_explain",
        name="PostgreSQL Query Explain",
        description="Run or interpret query plans and identify expensive PostgreSQL patterns.",
        category="postgresql",
        engines=["postgresql"],
        tags=["postgresql", "performance"],
    ),
    SkillMetadata(
        id="production_guard",
        name="Production Guard",
        description="Block destructive or production-risk actions unless safeguards are present.",
        category="safety",
        engines=[],
        risk_level="high",
        requires_approval=True,
        tags=["policy", "production"],
    ),
]


def _installation_map(db: Session | None) -> dict[str, LocalSkillInstallation]:
    if db is None:
        return {}
    installations = db.query(LocalSkillInstallation).all()
    return {item.skill_id: item for item in installations}


def _with_installation_state(skill: SkillMetadata, installation: LocalSkillInstallation | None) -> SkillMetadata:
    data = skill.model_dump()
    data["installed"] = installation is not None
    data["enabled"] = bool(installation.enabled) if installation else False
    return SkillMetadata(**data)


def list_skills(db: Session | None = None) -> list[SkillMetadata]:
    installations = _installation_map(db)
    return [_with_installation_state(skill, installations.get(skill.id)) for skill in OFFICIAL_SKILLS]


def get_skill(skill_id: str) -> SkillMetadata | None:
    return next((skill for skill in OFFICIAL_SKILLS if skill.id == skill_id), None)


def get_enabled_skill(db: Session | None, skill_id: str) -> SkillMetadata | None:
    skill = get_skill(skill_id)
    if not skill:
        return None
    if db is None:
        return skill

    installation = db.query(LocalSkillInstallation).filter(LocalSkillInstallation.skill_id == skill_id).first()
    if not installation or not installation.enabled:
        return None
    return _with_installation_state(skill, installation)


def install_skill(db: Session, skill_id: str) -> SkillMetadata | None:
    skill = get_skill(skill_id)
    if not skill:
        return None

    installation = db.query(LocalSkillInstallation).filter(LocalSkillInstallation.skill_id == skill_id).first()
    if installation:
        installation.enabled = True
        installation.version = skill.version
    else:
        installation = LocalSkillInstallation(skill_id=skill.id, version=skill.version, enabled=True)
        db.add(installation)
    db.commit()
    db.refresh(installation)
    return _with_installation_state(skill, installation)


def set_skill_enabled(db: Session, skill_id: str, enabled: bool) -> SkillMetadata | None:
    skill = get_skill(skill_id)
    if not skill:
        return None

    installation = db.query(LocalSkillInstallation).filter(LocalSkillInstallation.skill_id == skill_id).first()
    if not installation:
        installation = LocalSkillInstallation(skill_id=skill.id, version=skill.version, enabled=enabled)
        db.add(installation)
    else:
        installation.enabled = enabled
    db.commit()
    db.refresh(installation)
    return _with_installation_state(skill, installation)


def resolve_skills(profile: DatabaseProfile, db: Session | None = None) -> list[SkillMetadata]:
    engine = profile.engine.lower()
    installations = _installation_map(db)
    return [
        _with_installation_state(skill, installations.get(skill.id))
        for skill in OFFICIAL_SKILLS
        if installations.get(skill.id)
        and installations[skill.id].enabled
        and (not skill.engines or engine in [item.lower() for item in skill.engines])
    ]

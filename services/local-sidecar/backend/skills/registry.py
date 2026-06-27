from backend.models.schemas import DatabaseProfile, SkillMetadata


OFFICIAL_SKILLS = [
    SkillMetadata(id="create_database", name="Create Database", category="design", engines=[]),
    SkillMetadata(id="review_database", name="Review Database", category="review", engines=[], risk_level="low"),
    SkillMetadata(id="generate_diagram", name="Generate Diagram", category="diagram", engines=[], risk_level="low"),
    SkillMetadata(id="seed_data", name="Synthetic Data Seeder", category="synthetic-data", engines=[], risk_level="medium"),
    SkillMetadata(id="export_documentation", name="Export Documentation", category="documentation", engines=[]),
    SkillMetadata(
        id="safe_migration_basic",
        name="Safe Migration Basic",
        category="safety",
        engines=["postgresql"],
        risk_level="high",
        requires_approval=True,
        requires_backup=True,
        requires_sandbox=True,
    ),
    SkillMetadata(id="postgresql_inspect", name="PostgreSQL Inspect", category="postgresql", engines=["postgresql"]),
    SkillMetadata(
        id="postgresql_backup",
        name="PostgreSQL Backup",
        category="postgresql",
        engines=["postgresql"],
        risk_level="medium",
    ),
    SkillMetadata(
        id="postgresql_sandbox",
        name="PostgreSQL Sandbox",
        category="postgresql",
        engines=["postgresql"],
        risk_level="medium",
    ),
    SkillMetadata(id="postgresql_query_explain", name="PostgreSQL Query Explain", category="postgresql", engines=["postgresql"]),
    SkillMetadata(
        id="production_guard",
        name="Production Guard",
        category="safety",
        engines=[],
        risk_level="high",
        requires_approval=True,
    ),
]


def list_skills() -> list[SkillMetadata]:
    return OFFICIAL_SKILLS


def get_skill(skill_id: str) -> SkillMetadata | None:
    return next((skill for skill in OFFICIAL_SKILLS if skill.id == skill_id), None)


def resolve_skills(profile: DatabaseProfile) -> list[SkillMetadata]:
    engine = profile.engine.lower()
    return [
        skill
        for skill in OFFICIAL_SKILLS
        if skill.default_enabled and (not skill.engines or engine in [item.lower() for item in skill.engines])
    ]

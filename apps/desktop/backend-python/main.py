import argparse
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

# Import routers from the modules
from backend.api.audit_router import router as audit_router
from backend.api.agent_tools_router import router as agent_tools_router
from backend.api.connector_router import router as connector_router
from backend.api.generator_router import router as generator_router
from backend.api.mcp_router import router as mcp_router
from backend.api.parser_router import router as parser_router
from backend.api.safety_router import router as safety_router
from backend.api.skills_router import router as skills_router
from backend.api.sync_router import router as sync_router
from query_analyzer.api.router import router as analyzer_router

from backend.core.database import Base, engine
# Import models to ensure they are registered with Base
from backend.models import models as backend_models
from diagrams import models as diagrams_models

app = FastAPI(
    title="Fluxy Local Sidecar API",
    description="Local-first sidecar for diagrams, database inspection, synthetic data and query analysis",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    # Create SQLite tables
    Base.metadata.create_all(bind=engine)
    # create_all does not add columns to existing local SQLite databases.
    additions = {
        "projects": {
            "updated_at": "DATETIME",
            "deleted_at": "DATETIME",
            "is_public": "BOOLEAN NOT NULL DEFAULT 0",
            "share_access": "VARCHAR NOT NULL DEFAULT 'view'",
        },
        "diagrams": {
            "sql_content": "TEXT DEFAULT ''",
            "active_dialect": "VARCHAR NOT NULL DEFAULT 'postgresql'",
            "source_database": "VARCHAR",
            "selected_tables_json": "TEXT NOT NULL DEFAULT '[]'",
            "last_synced_at": "DATETIME",
            "updated_at": "DATETIME",
        },
    }
    with engine.begin() as connection:
        for table, columns in additions.items():
            existing = {column["name"] for column in inspect(engine).get_columns(table)}
            for name, definition in columns.items():
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {definition}"))
        # Older local databases received these columns through ALTER TABLE,
        # which leaves existing rows as NULL and breaks response validation.
        connection.execute(text(
            "UPDATE projects "
            "SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP) "
            "WHERE updated_at IS NULL"
        ))
        connection.execute(text(
            "UPDATE diagrams "
            "SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP) "
            "WHERE updated_at IS NULL"
        ))


# Configurar CORS (Tauri se conecta desde http://localhost o tauri://localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import diagrams router
from diagrams.api.router import router as diagrams_router

# Mount Mariela's routers
app.include_router(connector_router, prefix="/api/v1")
app.include_router(generator_router, prefix="/api/v1")
app.include_router(mcp_router, prefix="/api/v1")
app.include_router(parser_router, prefix="/api/v1")
app.include_router(safety_router, prefix="/api/v1")
app.include_router(skills_router, prefix="/api/v1")

# Mount Andre's routers
app.include_router(analyzer_router, prefix="/api/v1")
app.include_router(audit_router, prefix="/api/v1")
app.include_router(agent_tools_router, prefix="/api/v1")
app.include_router(sync_router, prefix="/api/v1")

# Mount ER Diagrams routers
app.include_router(diagrams_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "product": "Fluxy",
        "service": "local-sidecar",
        "message": "Fluxy Local Sidecar is running",
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fluxy Local Sidecar")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
    args = parser.parse_args()

    print(f"Starting Fluxy Local Sidecar on port {args.port}...")
    uvicorn.run(app, host="127.0.0.1", port=args.port)

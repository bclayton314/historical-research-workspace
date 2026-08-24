from app.routes.health import health_bp
from app.routes.notes import notes_bp
from app.routes.projects import projects_bp
from app.routes.sources import sources_bp

__all__ = [
    "health_bp",
    "notes_bp",
    "projects_bp",
    "sources_bp",
]
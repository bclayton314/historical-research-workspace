from flask import Blueprint, jsonify, request
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models import ResearchProject


projects_bp = Blueprint(
    "projects",
    __name__,
    url_prefix="/api/projects",
)


VALID_STATUSES = {
    "planning",
    "researching",
    "outlining",
    "writing",
    "complete",
}


def validation_error(
    message: str,
    status_code: int = 400,
):
    return (
        jsonify(
            {
                "error": "validation_error",
                "message": message,
            }
        ),
        status_code,
    )


def resource_not_found(message: str):
    return (
        jsonify(
            {
                "error": "not_found",
                "message": message,
            }
        ),
        404,
    )


@projects_bp.get("")
def list_projects():
    """Return all research projects, newest first."""

    statement = (
        select(ResearchProject)
        .options(
            selectinload(
                ResearchProject.sources
            )
        )
        .order_by(
            ResearchProject.created_at.desc()
        )
    )

    projects = db.session.execute(
        statement
    ).scalars().all()

    return jsonify(
        {
            "projects": [
                project.to_dict()
                for project in projects
            ],
            "count": len(projects),
        }
    )


@projects_bp.get("/<int:project_id>")
def get_project(project_id: int):
    """Return one research project with its sources."""

    statement = (
        select(ResearchProject)
        .options(
            selectinload(
                ResearchProject.sources
            )
        )
        .where(
            ResearchProject.id == project_id
        )
    )

    project = db.session.execute(
        statement
    ).scalar_one_or_none()

    if project is None:
        return resource_not_found(
            "Research project not found."
        )

    return jsonify(
        {
            "project": project.to_dict(
                include_sources=True
            )
        }
    )


@projects_bp.post("")
def create_project():
    """Create a new historical research project."""

    payload = request.get_json(silent=True)

    if payload is None:
        return validation_error(
            "The request body must contain valid JSON."
        )

    title = str(
        payload.get("title", "")
    ).strip()

    description = str(
        payload.get("description", "")
    ).strip()

    research_question = str(
        payload.get("research_question", "")
    ).strip()

    status = str(
        payload.get("status", "planning")
    ).strip().lower()

    if not title:
        return validation_error(
            "Project title is required."
        )

    if len(title) > 200:
        return validation_error(
            "Project title must not exceed 200 characters."
        )

    if status not in VALID_STATUSES:
        allowed_statuses = ", ".join(
            sorted(VALID_STATUSES)
        )

        return validation_error(
            "Invalid project status. "
            f"Allowed values: {allowed_statuses}."
        )

    project = ResearchProject(
        title=title,
        description=description,
        research_question=research_question,
        status=status,
    )

    db.session.add(project)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Project created successfully.",
                "project": project.to_dict(),
            }
        ),
        201,
    )
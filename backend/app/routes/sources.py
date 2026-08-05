from datetime import date
from typing import Any
from urllib.parse import urlparse

from flask import Blueprint, jsonify, request
from sqlalchemy import select

from app.extensions import db
from app.models import HistoricalSource, ResearchProject


sources_bp = Blueprint(
    "sources",
    __name__,
    url_prefix="/api/projects/<int:project_id>/sources",
)


VALID_SOURCE_TYPES = {
    "archive",
    "article",
    "book",
    "document",
    "interview",
    "journal",
    "map",
    "newspaper",
    "other",
    "photograph",
    "primary_source",
    "video",
    "website",
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


def resource_not_found(
    message: str,
):
    return (
        jsonify(
            {
                "error": "not_found",
                "message": message,
            }
        ),
        404,
    )


def parse_optional_date(
    value: Any,
    field_name: str,
) -> tuple[date | None, str | None]:
    """Parse an optional ISO date from a request payload."""

    if value in (None, ""):
        return None, None

    if not isinstance(value, str):
        return None, (
            f"{field_name} must be an ISO date "
            "in YYYY-MM-DD format."
        )

    try:
        parsed_date = date.fromisoformat(value)
    except ValueError:
        return None, (
            f"{field_name} must be an ISO date "
            "in YYYY-MM-DD format."
        )

    return parsed_date, None


def is_valid_http_url(value: str) -> bool:
    """Return whether a URL uses HTTP or HTTPS and has a host."""

    if not value:
        return True

    parsed = urlparse(value)

    return (
        parsed.scheme in {"http", "https"}
        and bool(parsed.netloc)
    )


def get_project_or_none(
    project_id: int,
) -> ResearchProject | None:
    return db.session.get(
        ResearchProject,
        project_id,
    )


@sources_bp.get("")
def list_sources(project_id: int):
    """Return the sources belonging to a project."""

    project = get_project_or_none(project_id)

    if project is None:
        return resource_not_found(
            "Research project not found."
        )

    source_type = request.args.get(
        "source_type",
        "",
    ).strip().lower()

    statement = (
        select(HistoricalSource)
        .where(
            HistoricalSource.project_id == project_id
        )
        .order_by(
            HistoricalSource.created_at.desc()
        )
    )

    if source_type:
        if source_type not in VALID_SOURCE_TYPES:
            return validation_error(
                "Invalid source type filter."
            )

        statement = statement.where(
            HistoricalSource.source_type
            == source_type
        )

    sources = db.session.execute(
        statement
    ).scalars().all()

    return jsonify(
        {
            "sources": [
                source.to_dict()
                for source in sources
            ],
            "count": len(sources),
            "project_id": project_id,
        }
    )


@sources_bp.post("")
def create_source(project_id: int):
    """Create a source inside a research project."""

    project = get_project_or_none(project_id)

    if project is None:
        return resource_not_found(
            "Research project not found."
        )

    payload = request.get_json(silent=True)

    if payload is None:
        return validation_error(
            "The request body must contain valid JSON."
        )

    title = str(
        payload.get("title", "")
    ).strip()

    author = str(
        payload.get("author", "")
    ).strip()

    source_type = str(
        payload.get("source_type", "book")
    ).strip().lower()

    publication = str(
        payload.get("publication", "")
    ).strip()

    url = str(
        payload.get("url", "")
    ).strip()

    citation = str(
        payload.get("citation", "")
    ).strip()

    summary = str(
        payload.get("summary", "")
    ).strip()

    reliability_notes = str(
        payload.get("reliability_notes", "")
    ).strip()

    if not title:
        return validation_error(
            "Source title is required."
        )

    if len(title) > 300:
        return validation_error(
            "Source title must not exceed 300 characters."
        )

    if len(author) > 250:
        return validation_error(
            "Author must not exceed 250 characters."
        )

    if len(publication) > 250:
        return validation_error(
            "Publication must not exceed 250 characters."
        )

    if source_type not in VALID_SOURCE_TYPES:
        allowed_types = ", ".join(
            sorted(VALID_SOURCE_TYPES)
        )

        return validation_error(
            "Invalid source type. "
            f"Allowed values: {allowed_types}."
        )

    if not is_valid_http_url(url):
        return validation_error(
            "URL must begin with http:// or https://."
        )

    publication_date, publication_date_error = (
        parse_optional_date(
            payload.get("publication_date"),
            "publication_date",
        )
    )

    if publication_date_error:
        return validation_error(
            publication_date_error
        )

    date_accessed, date_accessed_error = (
        parse_optional_date(
            payload.get("date_accessed"),
            "date_accessed",
        )
    )

    if date_accessed_error:
        return validation_error(
            date_accessed_error
        )

    source = HistoricalSource(
        project_id=project.id,
        title=title,
        author=author,
        source_type=source_type,
        publication=publication,
        publication_date=publication_date,
        url=url,
        citation=citation,
        summary=summary,
        reliability_notes=reliability_notes,
        date_accessed=date_accessed,
    )

    db.session.add(source)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Source created successfully.",
                "source": source.to_dict(),
            }
        ),
        201,
    )


@sources_bp.delete("/<int:source_id>")
def delete_source(
    project_id: int,
    source_id: int,
):
    """Delete a source from a project."""

    project = get_project_or_none(project_id)

    if project is None:
        return resource_not_found(
            "Research project not found."
        )

    source = db.session.get(
        HistoricalSource,
        source_id,
    )

    if (
        source is None
        or source.project_id != project_id
    ):
        return resource_not_found(
            "Historical source not found."
        )

    db.session.delete(source)
    db.session.commit()

    return jsonify(
        {
            "message": "Source deleted successfully.",
            "source_id": source_id,
        }
    )
from flask import Blueprint, jsonify, request
from sqlalchemy import select

from app.extensions import db
from app.models import (
    HistoricalSource,
    ResearchNote,
    ResearchProject,
)


notes_bp = Blueprint(
    "notes",
    __name__,
    url_prefix="/api/projects/<int:project_id>/notes",
)


VALID_NOTE_TYPES = {
    "argument",
    "event",
    "general",
    "person",
    "place",
    "quote",
    "script_idea",
    "statistic",
    "visual_idea",
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


def get_project_or_none(
    project_id: int,
) -> ResearchProject | None:
    return db.session.get(
        ResearchProject,
        project_id,
    )


def normalize_tags(value) -> str:
    """Normalize tags into comma-separated storage."""

    if value in (None, ""):
        return ""

    if isinstance(value, list):
        normalized = [
            str(tag).strip()
            for tag in value
            if str(tag).strip()
        ]

        return ", ".join(
            dict.fromkeys(normalized)
        )

    if isinstance(value, str):
        normalized = [
            tag.strip()
            for tag in value.split(",")
            if tag.strip()
        ]

        return ", ".join(
            dict.fromkeys(normalized)
        )

    return ""


@notes_bp.get("")
def list_notes(project_id: int):
    """Return research notes belonging to a project."""

    project = get_project_or_none(project_id)

    if project is None:
        return resource_not_found(
            "Research project not found."
        )

    note_type = request.args.get(
        "note_type",
        "",
    ).strip().lower()

    source_id_raw = request.args.get(
        "source_id",
        "",
    ).strip()

    statement = (
        select(ResearchNote)
        .where(
            ResearchNote.project_id == project_id
        )
        .order_by(
            ResearchNote.created_at.desc()
        )
    )

    if note_type:
        if note_type not in VALID_NOTE_TYPES:
            return validation_error(
                "Invalid note type filter."
            )

        statement = statement.where(
            ResearchNote.note_type == note_type
        )

    if source_id_raw:
        try:
            source_id = int(source_id_raw)
        except ValueError:
            return validation_error(
                "source_id must be an integer."
            )

        statement = statement.where(
            ResearchNote.source_id == source_id
        )

    notes = db.session.execute(
        statement
    ).scalars().all()

    return jsonify(
        {
            "notes": [
                note.to_dict()
                for note in notes
            ],
            "count": len(notes),
            "project_id": project_id,
        }
    )


@notes_bp.get("/<int:note_id>")
def get_note(
    project_id: int,
    note_id: int,
):
    """Return one research note."""

    project = get_project_or_none(project_id)

    if project is None:
        return resource_not_found(
            "Research project not found."
        )

    note = db.session.get(
        ResearchNote,
        note_id,
    )

    if (
        note is None
        or note.project_id != project_id
    ):
        return resource_not_found(
            "Research note not found."
        )

    return jsonify(
        {
            "note": note.to_dict(),
        }
    )


@notes_bp.post("")
def create_note(project_id: int):
    """Create a research note inside a project."""

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

    body = str(
        payload.get("body", "")
    ).strip()

    note_type = str(
        payload.get("note_type", "general")
    ).strip().lower()

    page_reference = str(
        payload.get("page_reference", "")
    ).strip()

    timestamp_reference = str(
        payload.get(
            "timestamp_reference",
            "",
        )
    ).strip()

    quotation = str(
        payload.get("quotation", "")
    ).strip()

    if not title:
        return validation_error(
            "Research note title is required."
        )

    if len(title) > 250:
        return validation_error(
            "Research note title must not exceed "
            "250 characters."
        )

    if note_type not in VALID_NOTE_TYPES:
        allowed_types = ", ".join(
            sorted(VALID_NOTE_TYPES)
        )

        return validation_error(
            "Invalid note type. "
            f"Allowed values: {allowed_types}."
        )

    if len(page_reference) > 100:
        return validation_error(
            "Page reference must not exceed "
            "100 characters."
        )

    if len(timestamp_reference) > 100:
        return validation_error(
            "Timestamp reference must not exceed "
            "100 characters."
        )

    source_id = payload.get("source_id")

    if source_id in ("", None):
        source_id = None
    else:
        try:
            source_id = int(source_id)
        except (TypeError, ValueError):
            return validation_error(
                "source_id must be an integer or null."
            )

        source = db.session.get(
            HistoricalSource,
            source_id,
        )

        if (
            source is None
            or source.project_id != project_id
        ):
            return validation_error(
                "The selected source does not belong "
                "to this research project."
            )

    tags = normalize_tags(
        payload.get("tags")
    )

    note = ResearchNote(
        project_id=project.id,
        source_id=source_id,
        title=title,
        body=body,
        note_type=note_type,
        page_reference=page_reference,
        timestamp_reference=timestamp_reference,
        quotation=quotation,
        tags=tags,
    )

    db.session.add(note)
    db.session.commit()

    return (
        jsonify(
            {
                "message": (
                    "Research note created successfully."
                ),
                "note": note.to_dict(),
            }
        ),
        201,
    )


@notes_bp.delete("/<int:note_id>")
def delete_note(
    project_id: int,
    note_id: int,
):
    """Delete a research note."""

    project = get_project_or_none(project_id)

    if project is None:
        return resource_not_found(
            "Research project not found."
        )

    note = db.session.get(
        ResearchNote,
        note_id,
    )

    if (
        note is None
        or note.project_id != project_id
    ):
        return resource_not_found(
            "Research note not found."
        )

    db.session.delete(note)
    db.session.commit()

    return jsonify(
        {
            "message": (
                "Research note deleted successfully."
            ),
            "note_id": note_id,
        }
    )
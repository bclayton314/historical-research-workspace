from datetime import datetime, timezone
from typing import Any

from app.extensions import db


class ResearchNote(db.Model):
    """Represents research extracted or developed inside a project."""

    __tablename__ = "research_notes"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    project_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "research_projects.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    source_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "historical_sources.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    title = db.Column(
        db.String(250),
        nullable=False,
    )

    body = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    note_type = db.Column(
        db.String(50),
        nullable=False,
        default="general",
        index=True,
    )

    page_reference = db.Column(
        db.String(100),
        nullable=False,
        default="",
    )

    timestamp_reference = db.Column(
        db.String(100),
        nullable=False,
        default="",
    )

    quotation = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    tags = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def tag_list(self) -> list[str]:
        """Return normalized tags as a list."""

        if not self.tags:
            return []

        return [
            tag.strip()
            for tag in self.tags.split(",")
            if tag.strip()
        ]

    def to_dict(self) -> dict[str, Any]:
        """Convert the note to JSON-compatible data."""

        return {
            "id": self.id,
            "project_id": self.project_id,
            "source_id": self.source_id,
            "title": self.title,
            "body": self.body,
            "note_type": self.note_type,
            "page_reference": self.page_reference,
            "timestamp_reference": (
                self.timestamp_reference
            ),
            "quotation": self.quotation,
            "tags": self.tag_list(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
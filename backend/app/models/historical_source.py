from datetime import date, datetime, timezone
from typing import Any

from app.extensions import db


class HistoricalSource(db.Model):
    """Represents a source collected for a research project."""

    __tablename__ = "historical_sources"

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

    title = db.Column(
        db.String(300),
        nullable=False,
    )

    author = db.Column(
        db.String(250),
        nullable=False,
        default="",
    )

    source_type = db.Column(
        db.String(50),
        nullable=False,
        default="book",
        index=True,
    )

    publication = db.Column(
        db.String(250),
        nullable=False,
        default="",
    )

    publication_date = db.Column(
        db.Date,
        nullable=True,
    )

    url = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    citation = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    summary = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    reliability_notes = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    date_accessed = db.Column(
        db.Date,
        nullable=True,
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

    notes = db.relationship(
        "ResearchNote",
        backref="source",
        lazy="selectin",
        passive_deletes=True,
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert the source to a JSON-compatible dictionary."""

        return {
            "id": self.id,
            "project_id": self.project_id,
            "title": self.title,
            "author": self.author,
            "source_type": self.source_type,
            "publication": self.publication,
            "publication_date": (
                self.publication_date.isoformat()
                if self.publication_date
                else None
            ),
            "url": self.url,
            "citation": self.citation,
            "summary": self.summary,
            "reliability_notes": self.reliability_notes,
            "date_accessed": (
                self.date_accessed.isoformat()
                if self.date_accessed
                else None
            ),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
from datetime import datetime, timezone

from app.extensions import db


class ResearchProject(db.Model):
    """Represents a historical research or video-essay project."""

    __tablename__ = "research_projects"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(
        db.String(200),
        nullable=False,
    )

    description = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    research_question = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    status = db.Column(
        db.String(50),
        nullable=False,
        default="planning",
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

    def to_dict(self) -> dict:
        """Convert the database model into a JSON-serializable dictionary."""

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "research_question": self.research_question,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
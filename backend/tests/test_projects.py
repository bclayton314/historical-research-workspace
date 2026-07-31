import pytest

from app import create_app
from app.config import TestingConfig
from app.extensions import db


@pytest.fixture()
def app():
    """Create an isolated Flask application for each test."""

    test_app = create_app(TestingConfig)

    with test_app.app_context():
        db.create_all()

    yield test_app

    with test_app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    """Return a Flask test client."""

    return app.test_client()


def test_health_check(client):
    response = client.get("/api/health")

    assert response.status_code == 200

    payload = response.get_json()

    assert payload["status"] == "healthy"
    assert payload["service"] == "historical-research-api"


def test_project_list_starts_empty(client):
    response = client.get("/api/projects")

    assert response.status_code == 200

    payload = response.get_json()

    assert payload["projects"] == []
    assert payload["count"] == 0


def test_create_project(client):
    response = client.post(
        "/api/projects",
        json={
            "title": "The Taku Forts",
            "description": "Research project",
            "research_question": (
                "Why did the Allies attack the forts?"
            ),
            "status": "researching",
        },
    )

    assert response.status_code == 201

    payload = response.get_json()
    project = payload["project"]

    assert project["id"] == 1
    assert project["title"] == "The Taku Forts"
    assert project["status"] == "researching"


def test_created_project_appears_in_list(client):
    client.post(
        "/api/projects",
        json={
            "title": "The Boxer Rebellion",
        },
    )

    response = client.get("/api/projects")
    payload = response.get_json()

    assert response.status_code == 200
    assert payload["count"] == 1
    assert payload["projects"][0]["title"] == (
        "The Boxer Rebellion"
    )


def test_title_is_required(client):
    response = client.post(
        "/api/projects",
        json={
            "description": "Missing title",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload["error"] == "validation_error"
    assert payload["message"] == "Project title is required."


def test_rejects_invalid_status(client):
    response = client.post(
        "/api/projects",
        json={
            "title": "Invalid Project",
            "status": "unknown",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload["error"] == "validation_error"
    assert "Invalid project status" in payload["message"]
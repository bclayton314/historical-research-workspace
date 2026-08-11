import pytest

from app import create_app
from app.config import TestingConfig
from app.extensions import db
from app.models import HistoricalSource, ResearchProject


@pytest.fixture()
def app():
    test_app = create_app(TestingConfig)

    with test_app.app_context():
        db.create_all()

    yield test_app

    with test_app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def project(app):
    with app.app_context():
        project = ResearchProject(
            title="The Boxer Rebellion",
            description="Video essay research",
            research_question=(
                "How did the conflict escalate?"
            ),
            status="researching",
        )

        db.session.add(project)
        db.session.commit()

        project_id = project.id

    return project_id


def test_source_list_starts_empty(
    client,
    project,
):
    response = client.get(
        f"/api/projects/{project}/sources"
    )

    assert response.status_code == 200

    payload = response.get_json()

    assert payload["sources"] == []
    assert payload["count"] == 0
    assert payload["project_id"] == project


def test_create_book_source(
    client,
    project,
):
    response = client.post(
        f"/api/projects/{project}/sources",
        json={
            "title": (
                "The Boxer Rebellion and "
                "the Great Game in China"
            ),
            "author": "David J. Silbey",
            "source_type": "book",
            "publication": "Hill and Wang",
            "publication_date": "2012-03-27",
            "citation": (
                "Silbey, David J. "
                "The Boxer Rebellion and the "
                "Great Game in China."
            ),
            "summary": (
                "A concise military and diplomatic "
                "history of the conflict."
            ),
        },
    )

    assert response.status_code == 201

    payload = response.get_json()
    source = payload["source"]

    assert source["project_id"] == project
    assert source["source_type"] == "book"
    assert source["author"] == "David J. Silbey"
    assert source["publication_date"] == (
        "2012-03-27"
    )


def test_created_source_appears_in_list(
    client,
    project,
):
    client.post(
        f"/api/projects/{project}/sources",
        json={
            "title": "The Taku Forts",
            "source_type": "article",
        },
    )

    response = client.get(
        f"/api/projects/{project}/sources"
    )

    payload = response.get_json()

    assert payload["count"] == 1
    assert payload["sources"][0]["title"] == (
        "The Taku Forts"
    )


def test_source_title_is_required(
    client,
    project,
):
    response = client.post(
        f"/api/projects/{project}/sources",
        json={
            "source_type": "book",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload["error"] == "validation_error"
    assert payload["message"] == (
        "Source title is required."
    )


def test_rejects_invalid_source_type(
    client,
    project,
):
    response = client.post(
        f"/api/projects/{project}/sources",
        json={
            "title": "Unknown source",
            "source_type": "telegram",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert "Invalid source type" in payload["message"]


def test_rejects_invalid_publication_date(
    client,
    project,
):
    response = client.post(
        f"/api/projects/{project}/sources",
        json={
            "title": "Test source",
            "source_type": "book",
            "publication_date": "June 1900",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert "YYYY-MM-DD" in payload["message"]


def test_rejects_invalid_url(
    client,
    project,
):
    response = client.post(
        f"/api/projects/{project}/sources",
        json={
            "title": "Invalid URL source",
            "source_type": "website",
            "url": "example.com/article",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload["message"] == (
        "URL must begin with http:// or https://."
    )


def test_filters_sources_by_type(
    client,
    project,
):
    client.post(
        f"/api/projects/{project}/sources",
        json={
            "title": "Book source",
            "source_type": "book",
        },
    )

    client.post(
        f"/api/projects/{project}/sources",
        json={
            "title": "Archive source",
            "source_type": "archive",
        },
    )

    response = client.get(
        f"/api/projects/{project}/sources"
        "?source_type=archive"
    )

    payload = response.get_json()

    assert payload["count"] == 1
    assert payload["sources"][0]["source_type"] == (
        "archive"
    )


def test_delete_source(
    client,
    app,
    project,
):
    create_response = client.post(
        f"/api/projects/{project}/sources",
        json={
            "title": "Temporary source",
            "source_type": "article",
        },
    )

    source_id = create_response.get_json()[
        "source"
    ]["id"]

    delete_response = client.delete(
        f"/api/projects/{project}/sources/"
        f"{source_id}"
    )

    assert delete_response.status_code == 200

    with app.app_context():
        source = db.session.get(
            HistoricalSource,
            source_id,
        )

        assert source is None


def test_delete_source_rejects_wrong_project(
    client,
    app,
    project,
):
    with app.app_context():
        second_project = ResearchProject(
            title="Second project",
        )

        db.session.add(second_project)
        db.session.commit()

        second_project_id = second_project.id

    create_response = client.post(
        f"/api/projects/{project}/sources",
        json={
            "title": "Project one source",
            "source_type": "book",
        },
    )

    source_id = create_response.get_json()[
        "source"
    ]["id"]

    response = client.delete(
        f"/api/projects/{second_project_id}/"
        f"sources/{source_id}"
    )

    assert response.status_code == 404


def test_unknown_project_returns_404(client):
    response = client.get(
        "/api/projects/9999/sources"
    )

    assert response.status_code == 404

    payload = response.get_json()

    assert payload["error"] == "not_found"
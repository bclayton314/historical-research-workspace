import pytest

from app import create_app
from app.config import TestingConfig
from app.extensions import db
from app.models import (
    HistoricalSource,
    ResearchNote,
    ResearchProject,
)


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
            title="The Taku Forts",
            description="Historical research",
            research_question=(
                "Why did the battle escalate "
                "the Boxer conflict?"
            ),
            status="researching",
        )

        db.session.add(project)
        db.session.commit()

        return project.id


@pytest.fixture()
def source(app, project):
    with app.app_context():
        source = HistoricalSource(
            project_id=project,
            title="The Boxer Rebellion",
            author="Example Author",
            source_type="book",
        )

        db.session.add(source)
        db.session.commit()

        return source.id


def test_note_list_starts_empty(
    client,
    project,
):
    response = client.get(
        f"/api/projects/{project}/notes"
    )

    assert response.status_code == 200

    payload = response.get_json()

    assert payload["notes"] == []
    assert payload["count"] == 0


def test_create_general_note(
    client,
    project,
):
    response = client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Escalation question",
            "body": (
                "Investigate whether the Allied "
                "ultimatum preceded reinforcement."
            ),
            "note_type": "general",
        },
    )

    assert response.status_code == 201

    note = response.get_json()["note"]

    assert note["title"] == (
        "Escalation question"
    )

    assert note["project_id"] == project
    assert note["source_id"] is None
    assert note["note_type"] == "general"


def test_create_source_linked_note(
    client,
    project,
    source,
):
    response = client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Taku ultimatum",
            "body": (
                "Foreign commanders demanded "
                "control of the forts."
            ),
            "note_type": "event",
            "source_id": source,
            "page_reference": "p. 83",
            "tags": [
                "taku-forts",
                "escalation",
            ],
        },
    )

    assert response.status_code == 201

    note = response.get_json()["note"]

    assert note["source_id"] == source
    assert note["page_reference"] == "p. 83"

    assert note["tags"] == [
        "taku-forts",
        "escalation",
    ]


def test_title_is_required(
    client,
    project,
):
    response = client.post(
        f"/api/projects/{project}/notes",
        json={
            "body": "Missing title.",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload["message"] == (
        "Research note title is required."
    )


def test_rejects_invalid_note_type(
    client,
    project,
):
    response = client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Test note",
            "note_type": "unknown",
        },
    )

    assert response.status_code == 400

    assert "Invalid note type" in (
        response.get_json()["message"]
    )


def test_rejects_source_from_other_project(
    client,
    app,
    project,
):
    with app.app_context():
        other_project = ResearchProject(
            title="Other project",
        )

        db.session.add(other_project)
        db.session.commit()

        other_source = HistoricalSource(
            project_id=other_project.id,
            title="Other source",
            source_type="book",
        )

        db.session.add(other_source)
        db.session.commit()

        other_source_id = other_source.id

    response = client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Invalid source note",
            "source_id": other_source_id,
        },
    )

    assert response.status_code == 400

    assert response.get_json()["message"] == (
        "The selected source does not belong "
        "to this research project."
    )


def test_get_single_note(
    client,
    project,
):
    create_response = client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Single note",
            "body": "Example body",
        },
    )

    note_id = create_response.get_json()[
        "note"
    ]["id"]

    response = client.get(
        f"/api/projects/{project}/notes/"
        f"{note_id}"
    )

    assert response.status_code == 200

    assert response.get_json()["note"][
        "title"
    ] == "Single note"


def test_filters_notes_by_type(
    client,
    project,
):
    client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Event note",
            "note_type": "event",
        },
    )

    client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Person note",
            "note_type": "person",
        },
    )

    response = client.get(
        f"/api/projects/{project}/notes"
        "?note_type=event"
    )

    payload = response.get_json()

    assert payload["count"] == 1

    assert payload["notes"][0][
        "title"
    ] == "Event note"


def test_filters_notes_by_source(
    client,
    project,
    source,
):
    client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Source-linked",
            "source_id": source,
        },
    )

    client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Unlinked note",
        },
    )

    response = client.get(
        f"/api/projects/{project}/notes"
        f"?source_id={source}"
    )

    payload = response.get_json()

    assert payload["count"] == 1

    assert payload["notes"][0][
        "title"
    ] == "Source-linked"


def test_delete_note(
    client,
    app,
    project,
):
    create_response = client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Temporary note",
        },
    )

    note_id = create_response.get_json()[
        "note"
    ]["id"]

    response = client.delete(
        f"/api/projects/{project}/notes/"
        f"{note_id}"
    )

    assert response.status_code == 200

    with app.app_context():
        assert db.session.get(
            ResearchNote,
            note_id,
        ) is None


def test_unknown_project_returns_404(
    client,
):
    response = client.get(
        "/api/projects/9999/notes"
    )

    assert response.status_code == 404


def test_deleted_source_preserves_note(
    client,
    app,
    project,
    source,
):
    create_response = client.post(
        f"/api/projects/{project}/notes",
        json={
            "title": "Preserved note",
            "source_id": source,
        },
    )

    note_id = create_response.get_json()[
        "note"
    ]["id"]

    client.delete(
        f"/api/projects/{project}/sources/"
        f"{source}"
    )

    with app.app_context():
        note = db.session.get(
            ResearchNote,
            note_id,
        )

        assert note is not None
        assert note.source_id is None
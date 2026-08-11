def test_get_project_by_id(client):
    create_response = client.post(
        "/api/projects",
        json={
            "title": "The China Relief Expedition",
            "status": "researching",
        },
    )

    project_id = create_response.get_json()[
        "project"
    ]["id"]

    response = client.get(
        f"/api/projects/{project_id}"
    )

    assert response.status_code == 200

    project = response.get_json()["project"]

    assert project["id"] == project_id
    assert project["title"] == (
        "The China Relief Expedition"
    )
    assert project["source_count"] == 0
    assert project["sources"] == []


def test_unknown_project_returns_404(client):
    response = client.get(
        "/api/projects/9999"
    )

    assert response.status_code == 404

    payload = response.get_json()

    assert payload["error"] == "not_found"


def test_project_source_count_updates(client):
    create_response = client.post(
        "/api/projects",
        json={
            "title": "The Taku Forts",
        },
    )

    project_id = create_response.get_json()[
        "project"
    ]["id"]

    client.post(
        f"/api/projects/{project_id}/sources",
        json={
            "title": "Naval intelligence report",
            "source_type": "primary_source",
        },
    )

    response = client.get("/api/projects")
    projects = response.get_json()["projects"]

    assert projects[0]["source_count"] == 1
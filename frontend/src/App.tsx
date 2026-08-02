import { useCallback, useEffect, useState } from "react";

import {
  createProject,
  getProjects,
} from "./api/projectsApi";

import { CreateProjectForm } from "./components/CreateProjectForm";
import { ProjectList } from "./components/ProjectList";

import type {
  CreateProjectPayload,
  ResearchProject,
} from "./types/project";

import "./App.css";

function App() {
  const [projects, setProjects] = useState<
    ResearchProject[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState<
    string | null
  >(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await getProjects();
      setProjects(response.projects);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load projects.";

      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  async function handleCreateProject(
    payload: CreateProjectPayload,
  ) {
    const response = await createProject(payload);

    setProjects((currentProjects) => [
      response.project,
      ...currentProjects,
    ]);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">
            Historical Research Workspace
          </p>

          <h1>
            Build evidence-driven historical video essays.
          </h1>

          <p className="hero__description">
            Organize research projects now. Sources, notes,
            timelines, maps, citations, outlines, and scripts
            will follow in later stages.
          </p>
        </div>

        <div className="hero__stat">
          <strong>{projects.length}</strong>
          <span>
            {projects.length === 1
              ? "active project"
              : "active projects"}
          </span>
        </div>
      </header>

      <main className="workspace-layout">
        <aside>
          <CreateProjectForm
            onSubmit={handleCreateProject}
          />
        </aside>

        <section className="projects-section">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">
                Your research
              </p>

              <h2>Projects</h2>
            </div>

            <button
              className="secondary-button"
              type="button"
              onClick={() => void loadProjects()}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>

          {isLoading && (
            <div className="message-panel">
              Loading research projects...
            </div>
          )}

          {!isLoading && loadError && (
            <div
              className="message-panel message-panel--error"
              role="alert"
            >
              <p>{loadError}</p>

              <button
                type="button"
                onClick={() => void loadProjects()}
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !loadError && (
            <ProjectList projects={projects} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
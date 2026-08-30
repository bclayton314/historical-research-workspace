import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createProject,
  getProject,
  getProjects,
} from "./api/projectsApi";

import {
  createSource,
  deleteSource,
} from "./api/sourcesApi";

import {
  CreateProjectForm,
} from "./components/CreateProjectForm";

import {
  ProjectDetail,
} from "./components/ProjectDetail";

import {
  ProjectList,
} from "./components/ProjectList";

import {
  createNote,
  deleteNote,
} from "./api/notesApi";

import type {
  CreateProjectPayload,
  ResearchProject,
  ResearchProjectDetail,
} from "./types/project";

import type {
  CreateSourcePayload,
} from "./types/source";

import type {
  CreateNotePayload,
} from "./types/note";

import "./App.css";

function App() {
  const [projects, setProjects] = useState<
    ResearchProject[]
  >([]);

  const [
    selectedProject,
    setSelectedProject,
  ] = useState<ResearchProjectDetail | null>(
    null,
  );

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState<number | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isProjectLoading,
    setIsProjectLoading,
  ] = useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [
    projectLoadError,
    setProjectLoadError,
  ] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await getProjects();
      setProjects(response.projects);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load projects.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSelectedProject = useCallback(
    async (projectId: number) => {
      setIsProjectLoading(true);
      setProjectLoadError(null);

      try {
        const response = await getProject(projectId);
        setSelectedProject(response.project);
      } catch (error) {
        setProjectLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load project.",
        );
      } finally {
        setIsProjectLoading(false);
      }
    },
    [],
  );

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

  async function handleOpenProject(
    projectId: number,
  ) {
    setSelectedProjectId(projectId);
    setSelectedProject(null);

    await loadSelectedProject(projectId);
  }

  function handleBackToProjects() {
    setSelectedProjectId(null);
    setSelectedProject(null);
    setProjectLoadError(null);

    void loadProjects();
  }

  async function handleCreateSource(
    payload: CreateSourcePayload,
  ) {
    if (selectedProjectId === null) {
      throw new Error(
        "No research project is selected.",
      );
    }

    const response = await createSource(
      selectedProjectId,
      payload,
    );

    setSelectedProject((currentProject) => {
      if (!currentProject) {
        return currentProject;
      }

      return {
        ...currentProject,
        source_count:
          currentProject.source_count + 1,
        sources: [
          response.source,
          ...currentProject.sources,
        ],
      };
    });

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedProjectId
          ? {
              ...project,
              source_count:
                project.source_count + 1,
            }
          : project,
      ),
    );
  }

  async function handleDeleteSource(
    sourceId: number,
  ) {
    if (selectedProjectId === null) {
      throw new Error(
        "No research project is selected.",
      );
    }

    await deleteSource(
      selectedProjectId,
      sourceId,
    );

    setSelectedProject((currentProject) => {
      if (!currentProject) {
        return currentProject;
      }

      return {
        ...currentProject,
        source_count: Math.max(
          0,
          currentProject.source_count - 1,
        ),
        sources: currentProject.sources.filter(
          (source) => source.id !== sourceId,
        ),
      };
    });

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedProjectId
          ? {
              ...project,
              source_count: Math.max(
                0,
                project.source_count - 1,
              ),
            }
          : project,
      ),
    );
  }

  async function handleCreateNote(
  payload: CreateNotePayload,
) {
  if (selectedProjectId === null) {
    throw new Error(
      "No research project is selected.",
    );
  }

  const response = await createNote(
    selectedProjectId,
    payload,
  );

  setSelectedProject((currentProject) => {
    if (!currentProject) {
      return currentProject;
    }

    return {
      ...currentProject,
      note_count:
        currentProject.note_count + 1,
      notes: [
        response.note,
        ...currentProject.notes,
      ],
    };
  });

  setProjects((currentProjects) =>
    currentProjects.map((project) =>
      project.id === selectedProjectId
        ? {
            ...project,
            note_count:
              project.note_count + 1,
          }
        : project,
    ),
  );
}

  if (selectedProjectId !== null) {
    const placeholderProject:
      ResearchProjectDetail = selectedProject ?? {
        id: selectedProjectId,
        title: "Loading project",
        description: "",
        research_question: "",
        status: "planning",
        source_count: 0,
        sources: [],
        note_count: 0,
        notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

    return (
      <div className="app-shell">
        <ProjectDetail
          project={placeholderProject}
          isLoading={isProjectLoading}
          error={projectLoadError}
          onBack={handleBackToProjects}
          onCreateSource={handleCreateSource}
          onDeleteSource={handleDeleteSource}
          onRetry={() => {
            void loadSelectedProject(
              selectedProjectId,
            );
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">
            Historical Research Workspace
          </p>

          <h1>
            Build evidence-driven historical
            video essays.
          </h1>

          <p className="hero__description">
            Create research projects and organize
            the books, archives, articles, documents,
            and primary sources behind each argument.
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
              className={
                "message-panel "
                + "message-panel--error"
              }
              role="alert"
            >
              <p>{loadError}</p>

              <button
                type="button"
                onClick={() =>
                  void loadProjects()
                }
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !loadError && (
            <ProjectList
              projects={projects}
              onOpenProject={handleOpenProject}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
import {
  useState,
} from "react";

import type {
  CreateNotePayload,
} from "../types/note";

import type {
  CreateSourcePayload,
} from "../types/source";

import type {
  ResearchProjectDetail,
} from "../types/project";

import {
  CreateResearchNoteForm,
} from "./CreateResearchNoteForm";

import {
  CreateSourceForm,
} from "./CreateSourceForm";

import {
  ResearchNotebook,
} from "./ResearchNotebook";

import {
  SourceLibrary,
} from "./SourceLibrary";


interface ProjectDetailProps {
  project: ResearchProjectDetail;
  isLoading: boolean;
  error: string | null;

  onBack: () => void;

  onCreateSource: (
    payload: CreateSourcePayload,
  ) => Promise<void>;

  onDeleteSource: (
    sourceId: number,
  ) => Promise<void>;

  onCreateNote: (
    payload: CreateNotePayload,
  ) => Promise<void>;

  onDeleteNote: (
    noteId: number,
  ) => Promise<void>;

  onRetry: () => void;
}


type WorkspaceTab =
  | "sources"
  | "notes";


export function ProjectDetail({
  project,
  isLoading,
  error,
  onBack,
  onCreateSource,
  onDeleteSource,
  onCreateNote,
  onDeleteNote,
  onRetry,
}: ProjectDetailProps) {
  const [
    activeTab,
    setActiveTab,
  ] = useState<WorkspaceTab>(
    "sources",
  );


  if (isLoading) {
    return (
      <main className="project-detail-page">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to projects
        </button>

        <div className="message-panel">
          Loading project workspace...
        </div>
      </main>
    );
  }


  if (error) {
    return (
      <main className="project-detail-page">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to projects
        </button>

        <div
          className={
            "message-panel "
            + "message-panel--error"
          }
          role="alert"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={onRetry}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }


  return (
    <main className="project-detail-page">
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        ← Back to projects
      </button>

      <header className="project-detail-hero">
        <div>
          <p className="hero__eyebrow">
            Research project
          </p>

          <h1>{project.title}</h1>

          {project.description && (
            <p className="hero__description">
              {project.description}
            </p>
          )}
        </div>

        <div className="project-stat-group">
          <div className="project-detail-stat">
            <strong>
              {project.sources.length}
            </strong>

            <span>
              {project.sources.length === 1
                ? "source"
                : "sources"}
            </span>
          </div>

          <div className="project-detail-stat">
            <strong>
              {project.notes.length}
            </strong>

            <span>
              {project.notes.length === 1
                ? "note"
                : "notes"}
            </span>
          </div>
        </div>
      </header>

      {project.research_question && (
        <section className="central-question-panel">
          <p className="section-eyebrow">
            Central research question
          </p>

          <h2>
            {project.research_question}
          </h2>
        </section>
      )}

      <nav className="workspace-tabs">
        <button
          type="button"
          className={
            activeTab === "sources"
              ? "workspace-tab workspace-tab--active"
              : "workspace-tab"
          }
          onClick={() => {
            setActiveTab("sources");
          }}
        >
          Sources
          <span>
            {project.sources.length}
          </span>
        </button>

        <button
          type="button"
          className={
            activeTab === "notes"
              ? "workspace-tab workspace-tab--active"
              : "workspace-tab"
          }
          onClick={() => {
            setActiveTab("notes");
          }}
        >
          Research notes
          <span>
            {project.notes.length}
          </span>
        </button>
      </nav>

      {activeTab === "sources" && (
        <div className="project-detail-layout">
          <aside>
            <CreateSourceForm
              onSubmit={onCreateSource}
            />
          </aside>

          <SourceLibrary
            sources={project.sources}
            onDeleteSource={
              onDeleteSource
            }
          />
        </div>
      )}

      {activeTab === "notes" && (
        <div className="project-detail-layout">
          <aside>
            <CreateResearchNoteForm
              sources={project.sources}
              onSubmit={onCreateNote}
            />
          </aside>

          <ResearchNotebook
            notes={project.notes}
            sources={project.sources}
            onDeleteNote={onDeleteNote}
          />
        </div>
      )}
    </main>
  );
}
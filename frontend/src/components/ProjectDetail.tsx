import type {
  CreateSourcePayload,
  HistoricalSource,
} from "../types/source";

import type {
  ResearchProjectDetail,
} from "../types/project";

import { CreateSourceForm } from "./CreateSourceForm";
import { SourceLibrary } from "./SourceLibrary";

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
  onRetry: () => void;
}

export function ProjectDetail({
  project,
  isLoading,
  error,
  onBack,
  onCreateSource,
  onDeleteSource,
  onRetry,
}: ProjectDetailProps) {
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
            "message-panel message-panel--error"
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

        <div className="project-detail-stat">
          <strong>{project.sources.length}</strong>

          <span>
            {project.sources.length === 1
              ? "source"
              : "sources"}
          </span>
        </div>
      </header>

      {project.research_question && (
        <section className="central-question-panel">
          <p className="section-eyebrow">
            Central research question
          </p>

          <h2>{project.research_question}</h2>
        </section>
      )}

      <div className="project-detail-layout">
        <aside>
          <CreateSourceForm
            onSubmit={onCreateSource}
          />
        </aside>

        <SourceLibrary
          sources={
            project.sources as HistoricalSource[]
          }
          onDeleteSource={onDeleteSource}
        />
      </div>
    </main>
  );
}
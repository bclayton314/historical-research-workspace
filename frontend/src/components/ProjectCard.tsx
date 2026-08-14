import type {
  ProjectStatus,
  ResearchProject,
} from "../types/project";

interface ProjectCardProps {
  project: ResearchProject;
  onOpen: (projectId: number) => void;
}

const statusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  researching: "Researching",
  outlining: "Outlining",
  writing: "Writing",
  complete: "Complete",
};

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
    },
  ).format(new Date(dateValue));
}

export function ProjectCard({
  project,
  onOpen,
}: ProjectCardProps) {
  return (
    <article className="project-card">
      <div className="project-card__header">
        <div>
          <p className="project-card__eyebrow">
            Research project
          </p>

          <h2>{project.title}</h2>
        </div>

        <span
          className={
            `status-badge `
            + `status-badge--${project.status}`
          }
        >
          {statusLabels[project.status]}
        </span>
      </div>

      {project.description ? (
        <p className="project-card__description">
          {project.description}
        </p>
      ) : (
        <p className="project-card__empty">
          No project description yet.
        </p>
      )}

      {project.research_question && (
        <section className="research-question">
          <h3>Central research question</h3>
          <p>{project.research_question}</p>
        </section>
      )}

      <footer className="project-card__footer">
        <div>
          <span>
            Created {formatDate(project.created_at)}
          </span>

          <span className="project-source-count">
            {project.source_count}{" "}
            {project.source_count === 1
              ? "source"
              : "sources"}
          </span>
        </div>

        <button
          type="button"
          className="open-project-button"
          onClick={() => onOpen(project.id)}
        >
          Open workspace
        </button>
      </footer>
    </article>
  );
}
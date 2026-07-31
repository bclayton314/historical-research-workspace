import type {
  ProjectStatus,
  ResearchProject,
} from "../types/project";

interface ProjectCardProps {
  project: ResearchProject;
}

const statusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  researching: "Researching",
  outlining: "Outlining",
  writing: "Writing",
  complete: "Complete",
};

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(dateValue));
}

export function ProjectCard({
  project,
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
          className={`status-badge status-badge--${project.status}`}
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
        Created {formatDate(project.created_at)}
      </footer>
    </article>
  );
}
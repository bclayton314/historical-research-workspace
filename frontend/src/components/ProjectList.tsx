import type { ResearchProject } from "../types/project";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: ResearchProject[];
}

export function ProjectList({
  projects,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <section className="empty-state">
        <h2>No research projects yet</h2>

        <p>
          Create your first project to begin organizing
          sources, notes, events, claims, and scripts.
        </p>
      </section>
    );
  }

  return (
    <section className="project-grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
        />
      ))}
    </section>
  );
}
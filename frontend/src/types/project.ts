import type {
  HistoricalSource,
} from "./source";

export type ProjectStatus =
  | "planning"
  | "researching"
  | "outlining"
  | "writing"
  | "complete";

export interface ResearchProject {
  id: number;
  title: string;
  description: string;
  research_question: string;
  status: ProjectStatus;
  source_count: number;
  created_at: string;
  updated_at: string;
}

export interface ResearchProjectDetail
  extends ResearchProject {
  sources: HistoricalSource[];
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  research_question: string;
  status: ProjectStatus;
}

export interface ProjectListResponse {
  projects: ResearchProject[];
  count: number;
}

export interface ProjectDetailResponse {
  project: ResearchProjectDetail;
}

export interface CreateProjectResponse {
  message: string;
  project: ResearchProject;
}
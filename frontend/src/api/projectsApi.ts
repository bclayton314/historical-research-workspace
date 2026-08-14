import { parseApiError } from "./apiUtils";

import type {
  CreateProjectPayload,
  CreateProjectResponse,
  ProjectDetailResponse,
  ProjectListResponse,
} from "../types/project";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5000/api";

export async function getProjects():
Promise<ProjectListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects`,
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (
    await response.json()
  ) as ProjectListResponse;
}

export async function getProject(
  projectId: number,
): Promise<ProjectDetailResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}`,
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (
    await response.json()
  ) as ProjectDetailResponse;
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<CreateProjectResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (
    await response.json()
  ) as CreateProjectResponse;
}
import type {
  CreateProjectPayload,
  CreateProjectResponse,
  ProjectListResponse,
} from "../types/project";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5000/api";

interface ApiErrorBody {
  message?: string;
}

async function parseError(response: Response): Promise<Error> {
  let message = `Request failed with status ${response.status}.`;

  try {
    const body = (await response.json()) as ApiErrorBody;

    if (body.message) {
      message = body.message;
    }
  } catch {
    // The response was not valid JSON.
  }

  return new Error(message);
}

export async function getProjects(): Promise<ProjectListResponse> {
  const response = await fetch(`${API_BASE_URL}/projects`);

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as ProjectListResponse;
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<CreateProjectResponse> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as CreateProjectResponse;
}
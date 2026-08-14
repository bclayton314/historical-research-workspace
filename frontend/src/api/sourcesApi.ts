import { parseApiError } from "./apiUtils";

import type {
  CreateSourcePayload,
  CreateSourceResponse,
  DeleteSourceResponse,
  SourceListResponse,
  SourceType,
} from "../types/source";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5000/api";

export async function getSources(
  projectId: number,
  sourceType?: SourceType | "all",
): Promise<SourceListResponse> {
  const searchParams = new URLSearchParams();

  if (
    sourceType
    && sourceType !== "all"
  ) {
    searchParams.set(
      "source_type",
      sourceType,
    );
  }

  const query = searchParams.toString();

  const url =
    `${API_BASE_URL}/projects/${projectId}/sources`
    + (query ? `?${query}` : "");

  const response = await fetch(url);

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (
    await response.json()
  ) as SourceListResponse;
}

export async function createSource(
  projectId: number,
  payload: CreateSourcePayload,
): Promise<CreateSourceResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/sources`,
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
  ) as CreateSourceResponse;
}

export async function deleteSource(
  projectId: number,
  sourceId: number,
): Promise<DeleteSourceResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}`
    + `/sources/${sourceId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (
    await response.json()
  ) as DeleteSourceResponse;
}
import { parseApiError } from "./apiUtils";

import type {
  CreateNotePayload,
  CreateNoteResponse,
  DeleteNoteResponse,
  NoteListResponse,
  NoteType,
} from "../types/note";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5000/api";


export async function getNotes(
  projectId: number,
  noteType?: NoteType | "all",
  sourceId?: number | null,
): Promise<NoteListResponse> {
  const params = new URLSearchParams();

  if (
    noteType
    && noteType !== "all"
  ) {
    params.set(
      "note_type",
      noteType,
    );
  }

  if (sourceId !== undefined && sourceId !== null) {
    params.set(
      "source_id",
      String(sourceId),
    );
  }

  const query = params.toString();

  const url =
    `${API_BASE_URL}/projects/${projectId}/notes`
    + (query ? `?${query}` : "");

  const response = await fetch(url);

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (
    await response.json()
  ) as NoteListResponse;
}


export async function createNote(
  projectId: number,
  payload: CreateNotePayload,
): Promise<CreateNoteResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/notes`,
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
  ) as CreateNoteResponse;
}


export async function deleteNote(
  projectId: number,
  noteId: number,
): Promise<DeleteNoteResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}`
    + `/notes/${noteId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (
    await response.json()
  ) as DeleteNoteResponse;
}
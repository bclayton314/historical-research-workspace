export type NoteType =
  | "argument"
  | "event"
  | "general"
  | "person"
  | "place"
  | "quote"
  | "script_idea"
  | "statistic"
  | "visual_idea";

export interface ResearchNote {
  id: number;
  project_id: number;
  source_id: number | null;
  title: string;
  body: string;
  note_type: NoteType;
  page_reference: string;
  timestamp_reference: string;
  quotation: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateNotePayload {
  title: string;
  body: string;
  note_type: NoteType;
  source_id: number | null;
  page_reference: string;
  timestamp_reference: string;
  quotation: string;
  tags: string[];
}

export interface NoteListResponse {
  notes: ResearchNote[];
  count: number;
  project_id: number;
}

export interface CreateNoteResponse {
  message: string;
  note: ResearchNote;
}

export interface DeleteNoteResponse {
  message: string;
  note_id: number;
}
export type SourceType =
  | "archive"
  | "article"
  | "book"
  | "document"
  | "interview"
  | "journal"
  | "map"
  | "newspaper"
  | "other"
  | "photograph"
  | "primary_source"
  | "video"
  | "website";

export interface HistoricalSource {
  id: number;
  project_id: number;
  title: string;
  author: string;
  source_type: SourceType;
  publication: string;
  publication_date: string | null;
  url: string;
  citation: string;
  summary: string;
  reliability_notes: string;
  date_accessed: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSourcePayload {
  title: string;
  author: string;
  source_type: SourceType;
  publication: string;
  publication_date: string;
  url: string;
  citation: string;
  summary: string;
  reliability_notes: string;
  date_accessed: string;
}

export interface SourceListResponse {
  sources: HistoricalSource[];
  count: number;
  project_id: number;
}

export interface CreateSourceResponse {
  message: string;
  source: HistoricalSource;
}

export interface DeleteSourceResponse {
  message: string;
  source_id: number;
}
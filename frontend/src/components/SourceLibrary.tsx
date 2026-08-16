import {
  useMemo,
  useState,
} from "react";

import type {
  HistoricalSource,
  SourceType,
} from "../types/source";

import { SourceCard } from "./SourceCard";

interface SourceLibraryProps {
  sources: HistoricalSource[];
  onDeleteSource: (
    sourceId: number,
  ) => Promise<void>;
}

type SourceFilter = SourceType | "all";

const filterOptions: Array<{
  value: SourceFilter;
  label: string;
}> = [
  { value: "all", label: "All sources" },
  { value: "book", label: "Books" },
  {
    value: "primary_source",
    label: "Primary sources",
  },
  { value: "article", label: "Articles" },
  { value: "journal", label: "Journals" },
  { value: "newspaper", label: "Newspapers" },
  { value: "archive", label: "Archives" },
  { value: "document", label: "Documents" },
  { value: "website", label: "Websites" },
  { value: "video", label: "Videos" },
  { value: "map", label: "Maps" },
  { value: "photograph", label: "Photographs" },
  { value: "interview", label: "Interviews" },
  { value: "other", label: "Other" },
];

export function SourceLibrary({
  sources,
  onDeleteSource,
}: SourceLibraryProps) {
  const [filter, setFilter] =
    useState<SourceFilter>("all");

  const [deletingSourceId, setDeletingSourceId] =
    useState<number | null>(null);

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  const visibleSources = useMemo(() => {
    if (filter === "all") {
      return sources;
    }

    return sources.filter(
      (source) => source.source_type === filter,
    );
  }, [filter, sources]);

  async function handleDelete(
    sourceId: number,
  ) {
    const shouldDelete = window.confirm(
      "Delete this source from the project?",
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingSourceId(sourceId);
    setDeleteError(null);

    try {
      await onDeleteSource(sourceId);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete source.",
      );
    } finally {
      setDeletingSourceId(null);
    }
  }

  return (
    <section className="source-library">
      <div className="source-library__header">
        <div>
          <p className="section-eyebrow">
            Evidence collection
          </p>

          <h2>Source library</h2>

          <p>
            {sources.length}{" "}
            {sources.length === 1
              ? "source"
              : "sources"}{" "}
            collected
          </p>
        </div>

        <label className="source-filter">
          Filter by type

          <select
            value={filter}
            onChange={(event) => {
              setFilter(
                event.target.value as SourceFilter,
              );
            }}
          >
            {filterOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {deleteError && (
        <p className="form-error" role="alert">
          {deleteError}
        </p>
      )}

      {sources.length === 0 ? (
        <div className="empty-state">
          <h3>No sources collected yet</h3>

          <p>
            Add your first book, article, archival
            document, website, map, or primary source.
          </p>
        </div>
      ) : visibleSources.length === 0 ? (
        <div className="empty-state">
          <h3>No matching sources</h3>

          <p>
            This project does not currently contain
            sources of the selected type.
          </p>
        </div>
      ) : (
        <div className="source-grid">
          {visibleSources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              isDeleting={
                deletingSourceId === source.id
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
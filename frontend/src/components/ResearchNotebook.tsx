import {
  useMemo,
  useState,
} from "react";

import type {
  NoteType,
  ResearchNote,
} from "../types/note";

import type {
  HistoricalSource,
} from "../types/source";

import {
  ResearchNoteCard,
} from "./ResearchNoteCard";


interface ResearchNotebookProps {
  notes: ResearchNote[];
  sources: HistoricalSource[];
  onDeleteNote: (
    noteId: number,
  ) => Promise<void>;
}


type NoteFilter = NoteType | "all";


const noteFilters: Array<{
  value: NoteFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "All notes",
  },
  {
    value: "general",
    label: "General",
  },
  {
    value: "event",
    label: "Events",
  },
  {
    value: "person",
    label: "People",
  },
  {
    value: "place",
    label: "Places",
  },
  {
    value: "argument",
    label: "Arguments",
  },
  {
    value: "quote",
    label: "Quotes",
  },
  {
    value: "statistic",
    label: "Statistics",
  },
  {
    value: "visual_idea",
    label: "Visual ideas",
  },
  {
    value: "script_idea",
    label: "Script ideas",
  },
];


export function ResearchNotebook({
  notes,
  sources,
  onDeleteNote,
}: ResearchNotebookProps) {
  const [
    noteFilter,
    setNoteFilter,
  ] = useState<NoteFilter>("all");

  const [
    sourceFilter,
    setSourceFilter,
  ] = useState<string>("all");

  const [
    deletingNoteId,
    setDeletingNoteId,
  ] = useState<number | null>(null);

  const [
    deleteError,
    setDeleteError,
  ] = useState<string | null>(null);


  const sourceMap = useMemo(
    () =>
      new Map(
        sources.map((source) => [
          source.id,
          source,
        ]),
      ),
    [sources],
  );


  const visibleNotes = useMemo(
    () =>
      notes.filter((note) => {
        const matchesType =
          noteFilter === "all"
          || note.note_type === noteFilter;

        const matchesSource =
          sourceFilter === "all"
          || note.source_id
            === Number(sourceFilter);

        return (
          matchesType
          && matchesSource
        );
      }),
    [
      notes,
      noteFilter,
      sourceFilter,
    ],
  );


  async function handleDelete(
    noteId: number,
  ) {
    const confirmed = window.confirm(
      "Delete this research note?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingNoteId(noteId);
    setDeleteError(null);

    try {
      await onDeleteNote(noteId);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete note.",
      );
    } finally {
      setDeletingNoteId(null);
    }
  }


  return (
    <section className="research-notebook">
      <div className="research-notebook__header">
        <div>
          <p className="section-eyebrow">
            Extracted research
          </p>

          <h2>Research notebook</h2>

          <p>
            {notes.length}{" "}
            {notes.length === 1
              ? "note"
              : "notes"}
          </p>
        </div>

        <div className="note-filters">
          <label>
            Note type

            <select
              value={noteFilter}
              onChange={(event) => {
                setNoteFilter(
                  event.target.value
                    as NoteFilter,
                );
              }}
            >
              {noteFilters.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Source

            <select
              value={sourceFilter}
              onChange={(event) => {
                setSourceFilter(
                  event.target.value,
                );
              }}
            >
              <option value="all">
                All sources
              </option>

              {sources.map((source) => (
                <option
                  key={source.id}
                  value={source.id}
                >
                  {source.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {deleteError && (
        <p
          className="form-error"
          role="alert"
        >
          {deleteError}
        </p>
      )}

      {notes.length === 0 ? (
        <div className="empty-state">
          <h3>No research notes yet</h3>

          <p>
            Start extracting useful facts,
            arguments, quotations, events,
            and ideas from your sources.
          </p>
        </div>
      ) : visibleNotes.length === 0 ? (
        <div className="empty-state">
          <h3>No matching notes</h3>

          <p>
            Try changing the note or
            source filter.
          </p>
        </div>
      ) : (
        <div className="research-note-grid">
          {visibleNotes.map((note) => (
            <ResearchNoteCard
              key={note.id}
              note={note}
              source={
                note.source_id
                  ? sourceMap.get(
                      note.source_id,
                    )
                  : undefined
              }
              isDeleting={
                deletingNoteId
                === note.id
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
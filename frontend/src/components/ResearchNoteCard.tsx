import type {
  ResearchNote,
  NoteType,
} from "../types/note";

import type {
  HistoricalSource,
} from "../types/source";


interface ResearchNoteCardProps {
  note: ResearchNote;
  source?: HistoricalSource;
  isDeleting: boolean;
  onDelete: (
    noteId: number,
  ) => Promise<void>;
}


const noteTypeLabels: Record<
  NoteType,
  string
> = {
  general: "General",
  event: "Event",
  person: "Person",
  place: "Place",
  argument: "Argument",
  quote: "Quote",
  statistic: "Statistic",
  visual_idea: "Visual idea",
  script_idea: "Script idea",
};


export function ResearchNoteCard({
  note,
  source,
  isDeleting,
  onDelete,
}: ResearchNoteCardProps) {
  return (
    <article className="research-note-card">
      <div className="research-note-card__header">
        <div>
          <span className="note-type-badge">
            {noteTypeLabels[note.note_type]}
          </span>

          <h3>{note.title}</h3>
        </div>

        <button
          type="button"
          className="danger-button"
          disabled={isDeleting}
          onClick={() => void onDelete(note.id)}
        >
          {isDeleting
            ? "Deleting..."
            : "Delete"}
        </button>
      </div>

      {source && (
        <div className="note-source">
          <span>Source</span>
          <strong>{source.title}</strong>
        </div>
      )}

      {note.body && (
        <p className="research-note-body">
          {note.body}
        </p>
      )}

      {note.quotation && (
        <blockquote className="note-quotation">
          <p>{note.quotation}</p>

          {(note.page_reference
            || note.timestamp_reference) && (
            <footer>
              {note.page_reference}

              {note.page_reference
                && note.timestamp_reference
                ? " · "
                : ""}

              {note.timestamp_reference}
            </footer>
          )}
        </blockquote>
      )}

      {!note.quotation
        && (
          note.page_reference
          || note.timestamp_reference
        ) && (
          <p className="note-reference">
            Reference:{" "}
            {note.page_reference}

            {note.page_reference
              && note.timestamp_reference
              ? " · "
              : ""}

            {note.timestamp_reference}
          </p>
        )}

      {note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag) => (
            <span key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
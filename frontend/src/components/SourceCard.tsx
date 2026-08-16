import type {
  HistoricalSource,
  SourceType,
} from "../types/source";

interface SourceCardProps {
  source: HistoricalSource;
  isDeleting: boolean;
  onDelete: (sourceId: number) => Promise<void>;
}

const sourceTypeLabels: Record<
  SourceType,
  string
> = {
  archive: "Archive",
  article: "Article",
  book: "Book",
  document: "Document",
  interview: "Interview",
  journal: "Journal",
  map: "Map",
  newspaper: "Newspaper",
  other: "Other",
  photograph: "Photograph",
  primary_source: "Primary source",
  video: "Video",
  website: "Website",
};

function formatDate(
  dateValue: string | null,
): string | null {
  if (!dateValue) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeZone: "UTC",
    },
  ).format(new Date(`${dateValue}T00:00:00Z`));
}

export function SourceCard({
  source,
  isDeleting,
  onDelete,
}: SourceCardProps) {
  const publicationDate = formatDate(
    source.publication_date,
  );

  return (
    <article className="source-card">
      <div className="source-card__heading">
        <div>
          <span className="source-type-badge">
            {sourceTypeLabels[source.source_type]}
          </span>

          <h3>{source.title}</h3>

          {source.author && (
            <p className="source-author">
              By {source.author}
            </p>
          )}
        </div>

        <button
          type="button"
          className="danger-button"
          disabled={isDeleting}
          onClick={() => void onDelete(source.id)}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {(source.publication || publicationDate) && (
        <p className="source-publication">
          {source.publication}

          {source.publication && publicationDate
            ? " · "
            : ""}

          {publicationDate}
        </p>
      )}

      {source.summary && (
        <section className="source-card__section">
          <h4>Summary</h4>
          <p>{source.summary}</p>
        </section>
      )}

      {source.reliability_notes && (
        <section className="source-card__section">
          <h4>Reliability notes</h4>
          <p>{source.reliability_notes}</p>
        </section>
      )}

      {source.citation && (
        <section className="source-citation">
          <h4>Citation</h4>
          <p>{source.citation}</p>
        </section>
      )}

      {source.url && (
        <a
          className="source-link"
          href={source.url}
          target="_blank"
          rel="noreferrer"
        >
          Open source
        </a>
      )}
    </article>
  );
}
import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import type {
  CreateSourcePayload,
  SourceType,
} from "../types/source";

interface CreateSourceFormProps {
  onSubmit: (
    payload: CreateSourcePayload,
  ) => Promise<void>;
}

const initialForm: CreateSourcePayload = {
  title: "",
  author: "",
  source_type: "book",
  publication: "",
  publication_date: "",
  url: "",
  citation: "",
  summary: "",
  reliability_notes: "",
  date_accessed: "",
};

const sourceTypeOptions: Array<{
  value: SourceType;
  label: string;
}> = [
  { value: "book", label: "Book" },
  { value: "article", label: "Article" },
  { value: "journal", label: "Journal" },
  { value: "newspaper", label: "Newspaper" },
  {
    value: "primary_source",
    label: "Primary source",
  },
  { value: "archive", label: "Archive" },
  { value: "document", label: "Document" },
  { value: "interview", label: "Interview" },
  { value: "map", label: "Map" },
  { value: "photograph", label: "Photograph" },
  { value: "video", label: "Video" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

export function CreateSourceForm({
  onSubmit,
}: CreateSourceFormProps) {
  const [form, setForm] =
    useState<CreateSourcePayload>(initialForm);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isExpanded, setIsExpanded] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  function handleChange(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) {
      setError("Please enter a source title.");
      return;
    }

    if (
      form.url
      && !/^https?:\/\/.+/i.test(form.url)
    ) {
      setError(
        "The source URL must begin with "
        + "http:// or https://.",
      );

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...form,
        title,
        author: form.author.trim(),
        publication: form.publication.trim(),
        url: form.url.trim(),
        citation: form.citation.trim(),
        summary: form.summary.trim(),
        reliability_notes:
          form.reliability_notes.trim(),
      });

      setForm(initialForm);
      setIsExpanded(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create source.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="create-source-form"
      onSubmit={handleSubmit}
    >
      <div className="form-heading">
        <p className="section-eyebrow">
          Source library
        </p>

        <h2>Add a source</h2>

        <p>
          Record the evidence you may later cite in
          notes, claims, outlines, and scripts.
        </p>
      </div>

      <div className="form-row">
        <label>
          Source title

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={300}
            placeholder={
              "The Boxer Rebellion and "
              + "the Great Game in China"
            }
            required
          />
        </label>

        <label>
          Source type

          <select
            name="source_type"
            value={form.source_type}
            onChange={handleChange}
          >
            {sourceTypeOptions.map((option) => (
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

      <div className="form-row">
        <label>
          Author or creator

          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            maxLength={250}
            placeholder="David J. Silbey"
          />
        </label>

        <label>
          Publication or archive

          <input
            name="publication"
            value={form.publication}
            onChange={handleChange}
            maxLength={250}
            placeholder="Hill and Wang"
          />
        </label>
      </div>

      <label>
        Summary

        <textarea
          name="summary"
          value={form.summary}
          onChange={handleChange}
          rows={4}
          placeholder={
            "What information or interpretation "
            + "does this source provide?"
          }
        />
      </label>

      <button
        type="button"
        className="text-button"
        onClick={() => {
          setIsExpanded((current) => !current);
        }}
      >
        {isExpanded
          ? "Hide additional details"
          : "Show citation and publication details"}
      </button>

      {isExpanded && (
        <div className="expanded-source-fields">
          <div className="form-row">
            <label>
              Publication date

              <input
                name="publication_date"
                type="date"
                value={form.publication_date}
                onChange={handleChange}
              />
            </label>

            <label>
              Date accessed

              <input
                name="date_accessed"
                type="date"
                value={form.date_accessed}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            URL

            <input
              name="url"
              type="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com/source"
            />
          </label>

          <label>
            Full citation

            <textarea
              name="citation"
              value={form.citation}
              onChange={handleChange}
              rows={3}
              placeholder={
                "Enter a Chicago, MLA, APA, "
                + "or working citation."
              }
            />
          </label>

          <label>
            Reliability notes

            <textarea
              name="reliability_notes"
              value={form.reliability_notes}
              onChange={handleChange}
              rows={3}
              placeholder={
                "Potential bias, limitations, "
                + "provenance, or conflicts."
              }
            />
          </label>
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Adding source..."
          : "Add source"}
      </button>
    </form>
  );
}
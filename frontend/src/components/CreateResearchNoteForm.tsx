import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import type {
  HistoricalSource,
} from "../types/source";

import type {
  CreateNotePayload,
  NoteType,
} from "../types/note";


interface CreateResearchNoteFormProps {
  sources: HistoricalSource[];
  onSubmit: (
    payload: CreateNotePayload,
  ) => Promise<void>;
}


interface NoteFormState {
  title: string;
  body: string;
  note_type: NoteType;
  source_id: string;
  page_reference: string;
  timestamp_reference: string;
  quotation: string;
  tags: string;
}


const initialForm: NoteFormState = {
  title: "",
  body: "",
  note_type: "general",
  source_id: "",
  page_reference: "",
  timestamp_reference: "",
  quotation: "",
  tags: "",
};


const noteTypeOptions: Array<{
  value: NoteType;
  label: string;
}> = [
  {
    value: "general",
    label: "General",
  },
  {
    value: "event",
    label: "Event",
  },
  {
    value: "person",
    label: "Person",
  },
  {
    value: "place",
    label: "Place",
  },
  {
    value: "argument",
    label: "Argument",
  },
  {
    value: "quote",
    label: "Quote",
  },
  {
    value: "statistic",
    label: "Statistic",
  },
  {
    value: "visual_idea",
    label: "Visual idea",
  },
  {
    value: "script_idea",
    label: "Script idea",
  },
];


export function CreateResearchNoteForm({
  sources,
  onSubmit,
}: CreateResearchNoteFormProps) {
  const [
    form,
    setForm,
  ] = useState<NoteFormState>(
    initialForm,
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    showEvidenceFields,
    setShowEvidenceFields,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  function handleChange(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) {
      setError(
        "Please enter a research note title.",
      );

      return;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title,
        body: form.body.trim(),
        note_type: form.note_type,
        source_id: form.source_id
          ? Number(form.source_id)
          : null,
        page_reference:
          form.page_reference.trim(),
        timestamp_reference:
          form.timestamp_reference.trim(),
        quotation:
          form.quotation.trim(),
        tags,
      });

      setForm(initialForm);
      setShowEvidenceFields(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create research note.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <form
      className="create-note-form"
      onSubmit={handleSubmit}
    >
      <div className="form-heading">
        <p className="section-eyebrow">
          Research notebook
        </p>

        <h2>Add a research note</h2>

        <p>
          Capture useful facts, interpretations,
          quotations, questions, and ideas from
          your research.
        </p>
      </div>

      <label>
        Note title

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          maxLength={250}
          placeholder="Taku Fort ultimatum"
          required
        />
      </label>

      <div className="form-row">
        <label>
          Note type

          <select
            name="note_type"
            value={form.note_type}
            onChange={handleChange}
          >
            {noteTypeOptions.map(
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
            name="source_id"
            value={form.source_id}
            onChange={handleChange}
          >
            <option value="">
              No linked source
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

      <label>
        Note

        <textarea
          name="body"
          value={form.body}
          onChange={handleChange}
          rows={5}
          placeholder={
            "Record the important information, "
            + "interpretation, question, or idea."
          }
        />
      </label>

      <label>
        Tags

        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder={
            "taku-forts, escalation, naval-war"
          }
        />

        <span className="form-help">
          Separate tags with commas.
        </span>
      </label>

      <button
        type="button"
        className="text-button"
        onClick={() => {
          setShowEvidenceFields(
            (current) => !current,
          );
        }}
      >
        {showEvidenceFields
          ? "Hide evidence details"
          : "Add quotation or reference"}
      </button>

      {showEvidenceFields && (
        <div className="expanded-note-fields">
          <div className="form-row">
            <label>
              Page reference

              <input
                name="page_reference"
                value={form.page_reference}
                onChange={handleChange}
                placeholder="p. 83"
              />
            </label>

            <label>
              Timestamp

              <input
                name="timestamp_reference"
                value={
                  form.timestamp_reference
                }
                onChange={handleChange}
                placeholder="12:43"
              />
            </label>
          </div>

          <label>
            Quotation

            <textarea
              name="quotation"
              value={form.quotation}
              onChange={handleChange}
              rows={4}
              placeholder={
                "Record an exact quotation "
                + "from the source."
              }
            />
          </label>
        </div>
      )}

      {error && (
        <p
          className="form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Adding note..."
          : "Add research note"}
      </button>
    </form>
  );
}
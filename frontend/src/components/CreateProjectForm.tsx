import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import type {
  CreateProjectPayload,
  ProjectStatus,
} from "../types/project";

interface CreateProjectFormProps {
  onSubmit: (
    payload: CreateProjectPayload,
  ) => Promise<void>;
}

const initialForm: CreateProjectPayload = {
  title: "",
  description: "",
  research_question: "",
  status: "planning",
};

export function CreateProjectForm({
  onSubmit,
}: CreateProjectFormProps) {
  const [form, setForm] =
    useState<CreateProjectPayload>(initialForm);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  function handleTextChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleStatusChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      status: event.target.value as ProjectStatus,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedTitle = form.title.trim();

    if (!trimmedTitle) {
      setError("Please enter a project title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...form,
        title: trimmedTitle,
        description: form.description.trim(),
        research_question:
          form.research_question.trim(),
      });

      setForm(initialForm);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to create the project.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="create-project-form"
      onSubmit={handleSubmit}
    >
      <div className="form-heading">
        <p className="section-eyebrow">
          Start a workspace
        </p>

        <h2>Create a research project</h2>

        <p>
          Define the subject and central question before
          collecting evidence.
        </p>
      </div>

      <label>
        Project title

        <input
          name="title"
          type="text"
          value={form.title}
          onChange={handleTextChange}
          maxLength={200}
          placeholder="The Assault on the Taku Forts"
          required
        />
      </label>

      <label>
        Description

        <textarea
          name="description"
          value={form.description}
          onChange={handleTextChange}
          rows={4}
          placeholder={
            "What historical subject will this project investigate?"
          }
        />
      </label>

      <label>
        Central research question

        <textarea
          name="research_question"
          value={form.research_question}
          onChange={handleTextChange}
          rows={3}
          placeholder={
            "Why did the Allied attack escalate the Boxer crisis?"
          }
        />
      </label>

      <label>
        Initial status

        <select
          value={form.status}
          onChange={handleStatusChange}
        >
          <option value="planning">Planning</option>
          <option value="researching">
            Researching
          </option>
          <option value="outlining">Outlining</option>
          <option value="writing">Writing</option>
          <option value="complete">Complete</option>
        </select>
      </label>

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
          ? "Creating project..."
          : "Create project"}
      </button>
    </form>
  );
}
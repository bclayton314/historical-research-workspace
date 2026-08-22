import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import {
  SourceLibrary,
} from "./SourceLibrary";

import type {
  HistoricalSource,
} from "../types/source";

const sources: HistoricalSource[] = [
  {
    id: 1,
    project_id: 1,
    title: "Military history book",
    author: "Example Author",
    source_type: "book",
    publication: "Example Press",
    publication_date: "2012-01-01",
    url: "",
    citation: "",
    summary: "Book summary",
    reliability_notes: "",
    date_accessed: null,
    created_at: "2026-08-01T12:00:00Z",
    updated_at: "2026-08-01T12:00:00Z",
  },
  {
    id: 2,
    project_id: 1,
    title: "Archival report",
    author: "",
    source_type: "archive",
    publication: "",
    publication_date: null,
    url: "",
    citation: "",
    summary: "Archive summary",
    reliability_notes: "",
    date_accessed: null,
    created_at: "2026-08-02T12:00:00Z",
    updated_at: "2026-08-02T12:00:00Z",
  },
];

describe("SourceLibrary", () => {
  it("renders all sources", () => {
    render(
      <SourceLibrary
        sources={sources}
        onDeleteSource={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Military history book"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Archival report"),
    ).toBeInTheDocument();
  });

  it("filters sources by type", async () => {
    const user = userEvent.setup();

    render(
      <SourceLibrary
        sources={sources}
        onDeleteSource={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText("Filter by type"),
      "archive",
    );

    expect(
      screen.queryByText(
        "Military history book",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Archival report"),
    ).toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(
      <SourceLibrary
        sources={[]}
        onDeleteSource={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "No sources collected yet",
      ),
    ).toBeInTheDocument();
  });
});
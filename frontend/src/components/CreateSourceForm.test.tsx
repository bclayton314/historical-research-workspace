import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import {
  CreateSourceForm,
} from "./CreateSourceForm";

describe("CreateSourceForm", () => {
  it("requires a source title", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CreateSourceForm onSubmit={onSubmit} />,
    );

    await user.click(
      screen.getByRole(
        "button",
        { name: "Add source" },
      ),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the source form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(
      undefined,
    );

    render(
      <CreateSourceForm onSubmit={onSubmit} />,
    );

    await user.type(
      screen.getByLabelText("Source title"),
      "The Boxer Rebellion",
    );

    await user.type(
      screen.getByLabelText(
        "Author or creator",
      ),
      "David J. Silbey",
    );

    await user.selectOptions(
      screen.getByLabelText("Source type"),
      "book",
    );

    await user.click(
      screen.getByRole(
        "button",
        { name: "Add source" },
      ),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "The Boxer Rebellion",
        author: "David J. Silbey",
        source_type: "book",
      }),
    );
  });

  it("reveals additional fields", async () => {
    const user = userEvent.setup();

    render(
      <CreateSourceForm
        onSubmit={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name:
            "Show citation and publication details",
        },
      ),
    );

    expect(
      screen.getByLabelText("Full citation"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Reliability notes"),
    ).toBeInTheDocument();
  });
});
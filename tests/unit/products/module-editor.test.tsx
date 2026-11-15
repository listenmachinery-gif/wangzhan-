// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { ModuleEditorRegistry, type JsonValue } from "@/components/admin/products/ModuleEditorRegistry";
import { createDraftProductModule } from "@/lib/product-modules/drafts";

afterEach(cleanup);

function Editor({ type }: { type: "HERO" | "TECHNICAL" }) {
  let current = createDraftProductModule(type) as JsonValue;
  function Harness() {
    const [value, setValue] = useState(current);
    return <ModuleEditorRegistry type={type} value={value} media={[{ id: "media-1", name: "machine.webp" }]} onChange={(next) => { current = next; setValue(next); }} />;
  }
  render(<Harness />);
  return () => current;
}

describe("ModuleEditorRegistry", () => {
  it("can add optional responsive Hero fields and choose durable media URLs", () => {
    const value = Editor({ type: "HERO" });
    fireEvent.click(screen.getByRole("button", { name: "添加 Tablet" }));
    fireEvent.change(screen.getByLabelText("Tablet 媒体资源"), { target: { value: "media-1" } });
    expect(value()).toMatchObject({ images: { tablet: "/api/media/media-1" } });
  });

  it("renames technical row keys when a column key changes", () => {
    const value = Editor({ type: "TECHNICAL" });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "model" } });
    expect(value()).toMatchObject({ columns: [{ key: "model" }], rows: [{ model: "" }] });
  });

  it("adds a second technical column without deleting the first column values", () => {
    const value = Editor({ type: "TECHNICAL" });
    fireEvent.click(screen.getAllByRole("button", { name: "添加项目" })[1]);
    fireEvent.change(screen.getAllByLabelText("Key")[1], { target: { value: "width" } });
    expect(value()).toMatchObject({
      columns: [{ key: "value" }, { key: "width" }],
      rows: [{ value: "", width: "" }],
    });
  });

  it("uses the first unused generated technical column key", () => {
    const value = Editor({ type: "TECHNICAL" });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "column_2" } });
    fireEvent.click(screen.getAllByRole("button", { name: "添加项目" })[1]);
    expect(value()).toMatchObject({
      columns: [{ key: "column_2" }, { key: "column_1" }],
    });
  });
});

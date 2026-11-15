// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { ModuleEditorRegistry, type JsonValue } from "@/components/admin/products/ModuleEditorRegistry";
import { createDraftProductModule } from "@/lib/product-modules/drafts";

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
});

// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { HomeProductShowcase } from "@/components/site/home/HomeProductShowcase";
import { homepageRedesignDocument } from "@/lib/page-builder/default-homepage";

const content = homepageRedesignDocument.nodes[2].content as React.ComponentProps<typeof HomeProductShowcase>["content"];

afterEach(cleanup);

describe("HomeProductShowcase", () => {
  it("changes copy, link and image together only after an explicit click", async () => {
    const user = userEvent.setup();
    render(<HomeProductShowcase content={content} />);

    const shearing = screen.getByRole("tab", { name: "SHEARING MACHINES" });
    const laser = screen.getByRole("tab", { name: "LASER CUTTING MACHINES" });
    expect(shearing).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { level: 3, name: "A Cleaner Cut. A Smarter Workflow." })).toBeInTheDocument();

    await user.click(laser);

    expect(laser).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { level: 3, name: "Complex Geometry. Clean Results." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Laser Cutting Machines" })).toHaveAttribute("href", "/products/series/laser-cutting-machines");
    expect(screen.getByAltText("ZYRON laser cutting machine")).toHaveAttribute("src", expect.stringContaining("laser-cutting-machine.webp"));
  });

  it("keeps rapid selections atomic and supports keyboard tab activation", async () => {
    const user = userEvent.setup();
    render(<HomeProductShowcase content={content} />);

    await user.click(screen.getByRole("tab", { name: "PRESS BRAKES" }));
    await user.click(screen.getByRole("tab", { name: "SHREDDING MACHINES" }));
    expect(screen.getByRole("heading", { level: 3, name: "Engineered for Demanding Reduction." })).toBeInTheDocument();
    expect(screen.getByAltText("ZYRON industrial shredding machine")).toBeInTheDocument();

    const rolling = screen.getByRole("tab", { name: "PLATE ROLLING MACHINES" });
    rolling.focus();
    await user.keyboard("{Enter}");
    expect(rolling).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { level: 3, name: "Shape Every Curve with Confidence." })).toBeInTheDocument();
  });
});

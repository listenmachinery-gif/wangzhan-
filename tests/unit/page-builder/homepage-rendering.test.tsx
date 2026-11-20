// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ManagedCompanyStrength } from "@/components/site/ManagedCompanyStrength";
import { ManagedWhyChoose } from "@/components/site/ManagedWhyChoose";
import { defaultHomepageDocument } from "@/lib/page-builder/default-homepage";
import { parsePublishedPage } from "@/lib/repositories/page-repository";
import type { PageNode } from "@/lib/page-builder/schema";

afterEach(cleanup);

describe("published homepage resolution", () => {
  it("returns only valid published page documents", () => {
    expect(
      parsePublishedPage({
        status: "PUBLISHED",
        publishedAt: new Date(),
        publishedContent: defaultHomepageDocument,
      }),
    ).toEqual(defaultHomepageDocument);
    expect(
      parsePublishedPage({
        status: "DRAFT",
        publishedAt: new Date(),
        publishedContent: defaultHomepageDocument,
      }),
    ).toEqual(defaultHomepageDocument);
    expect(
      parsePublishedPage({
        status: "DRAFT",
        publishedAt: null,
        publishedContent: defaultHomepageDocument,
      }),
    ).toBeNull();
    expect(
      parsePublishedPage({
        status: "PUBLISHED",
        publishedAt: new Date(),
        publishedContent: { schemaVersion: 99, nodes: [] },
      }),
    ).toBeNull();
    expect(parsePublishedPage(null)).toBeNull();
  });
});

describe("managed homepage modules", () => {
  it("preserves the existing homepage copy when no published node exists", () => {
    render(
      <>
        <ManagedCompanyStrength />
        <ManagedWhyChoose />
      </>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Manufacturing capacity behind every solution.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cutting")).toBeInTheDocument();
    expect(screen.getByText("Sheet Processing")).toBeInTheDocument();
    expect(screen.queryByText("15+")).not.toBeInTheDocument();
    expect(screen.queryByText("60+")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Built for buyers who need practical production answers.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Complete Product Range" }),
    ).toBeInTheDocument();
  });

  it("renders validated published content instead of the fallback copy", () => {
    const factory = defaultHomepageDocument.nodes.find(
      (node) => node.type === "FACTORY_STATS",
    )!;
    const advantages = defaultHomepageDocument.nodes.find(
      (node) => node.type === "ADVANTAGES",
    )!;
    const publishedFactory = {
      ...factory,
      content: {
        ...(factory.content as Record<string, unknown>),
        heading: "Published factory strength",
        stats: [{ value: "25+", label: "Export markets" }],
      },
    } as PageNode;
    const publishedAdvantages = {
      ...advantages,
      content: {
        ...(advantages.content as Record<string, unknown>),
        heading: "Published service advantages",
        items: [
          { title: "Engineering Review", body: "Verified before quotation." },
        ],
      },
    } as PageNode;

    render(
      <>
        <ManagedCompanyStrength node={publishedFactory} />
        <ManagedWhyChoose node={publishedAdvantages} />
      </>,
    );

    expect(
      screen.getByRole("heading", { name: "Published factory strength" }),
    ).toBeInTheDocument();
    expect(screen.getByText("25+")).toBeInTheDocument();
    expect(screen.queryByText("15+")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Published service advantages" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Engineering Review" }),
    ).toBeInTheDocument();
  });
});

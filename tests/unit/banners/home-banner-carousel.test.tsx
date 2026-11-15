// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { HomeBannerCarousel } from "@/components/site/HomeBannerCarousel";
import type { PublicBanner } from "@/lib/repositories/banner-repository";

function banner(id: string, title: string): PublicBanner {
  const image = { url: `/api/media/${id}`, alt: `${title} image`, kind: "IMAGE" as const, mimeType: "image/webp" };
  return {
    id,
    title,
    subtitle: null,
    buttonText: null,
    buttonUrl: null,
    textColor: "#ffffff",
    textPosition: "CENTER",
    maskOpacity: 50,
    desktop: image,
    tablet: image,
    mobile: image,
  };
}

describe("HomeBannerCarousel", () => {
  afterEach(cleanup);
  it("renders one responsive banner without carousel controls", () => {
    const { container } = render(<HomeBannerCarousel banners={[banner("one", "First banner")]} />);
    expect(screen.getByRole("heading", { name: "First banner" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /banner/i })).not.toBeInTheDocument();
    expect(container.querySelector("source[data-banner-viewport='mobile']")).toHaveAttribute("srcset", "/api/media/one");
  });

  it("provides deterministic controls when multiple banners are present", () => {
    render(<HomeBannerCarousel banners={[banner("one", "First banner"), banner("two", "Second banner")]} />);
    expect(screen.getByRole("heading", { name: "First banner" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next banner" }));
    expect(screen.getByRole("heading", { name: "Second banner" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous banner" }));
    expect(screen.getByRole("heading", { name: "First banner" })).toBeInTheDocument();
  });

  it("renders video banners as muted inline video rather than broken images", () => {
    const video = banner("video", "Video banner");
    video.desktop = { url: "/api/media/video", alt: "Factory video", kind: "VIDEO", mimeType: "video/mp4" };
    video.tablet = video.desktop;
    video.mobile = video.desktop;
    const { container } = render(<HomeBannerCarousel banners={[video]} />);
    const elements = container.querySelectorAll("video");
    expect(elements).toHaveLength(1);
    const element = elements[0];
    expect(element.querySelectorAll("source")).toHaveLength(3);
    expect(element.querySelector("source[data-banner-viewport='desktop']")).toHaveAttribute("src", "/api/media/video");
    expect(element).toHaveAttribute("playsinline");
    expect(element).toHaveProperty("muted", true);
  });

  it("includes responsive media sources in server-rendered HTML before hydration", () => {
    const html = renderToString(<HomeBannerCarousel banners={[banner("ssr", "SSR banner")]} />);
    expect(html).toContain("/api/media/ssr");
    expect(html).toContain("(min-width: 1024px)");
    expect(html).toContain("<picture>");
  });
});

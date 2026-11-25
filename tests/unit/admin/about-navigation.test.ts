import { describe, expect, it } from "vitest";

import { getAdminNavigation } from "@/components/admin/AdminSidebar";

describe("About ZYRON admin navigation", () => {
  it("gives content editors a dedicated Chinese About entry", () => {
    const items = getAdminNavigation({
      id: "editor-1",
      email: "editor@zyron.test",
      name: "Editor",
      roles: ["CONTENT_EDITOR"],
    });
    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({ href: "/admin/about", label: "关于 ZYRON" }),
    ]));
  });
});

import { describe, expect, it } from "vitest";

import { can, type Permission, type Principal, ROLE_PERMISSIONS } from "@/lib/auth/permissions";

function principal(id: string, roles: Principal["roles"]): Principal {
  return { id, email: `${id}@example.com`, name: id, roles };
}

describe("ZYRON CMS role permissions", () => {
  it("gives Super Admin every declared permission", () => {
    const superAdmin = principal("super", ["SUPER_ADMIN"]);

    for (const permission of Object.keys(ROLE_PERMISSIONS.SUPER_ADMIN) as Permission[]) {
      expect(can(superAdmin, permission)).toBe(true);
    }
    expect(can(superAdmin, "role.manage")).toBe(true);
  });

  it("lets Admin manage P0 records but not Super Admin security", () => {
    const admin = principal("admin", ["ADMIN"]);

    expect(can(admin, "product.publish")).toBe(true);
    expect(can(admin, "lead.assign")).toBe(true);
    expect(can(admin, "analytics.read.summary")).toBe(true);
    expect(can(admin, "analytics.read.visitors")).toBe(true);
    expect(can(admin, "analytics.export")).toBe(true);
    expect(can(admin, "user.manage", { targetRoles: ["SALES"] })).toBe(true);
    expect(can(admin, "user.manage", { targetRoles: ["SUPER_ADMIN"] })).toBe(false);
    expect(can(admin, "role.manage")).toBe(false);
    expect(can(admin, "security.manage")).toBe(false);
  });

  it("limits Product Editor to product catalogue and related media", () => {
    const editor = principal("product", ["PRODUCT_EDITOR"]);

    expect(can(editor, "product.write")).toBe(true);
    expect(can(editor, "product.publish")).toBe(true);
    expect(can(editor, "specification.write")).toBe(true);
    expect(can(editor, "media.write")).toBe(true);
    expect(can(editor, "lead.read.all")).toBe(false);
    expect(can(editor, "seo.write.global")).toBe(false);
    expect(can(editor, "user.manage")).toBe(false);
    expect(can(editor, "analytics.read.summary")).toBe(false);
    expect(can(editor, "analytics.read.visitors")).toBe(false);
    expect(can(editor, "analytics.export")).toBe(false);
  });

  it("limits Content Editor to banners, shared media, and SEO", () => {
    const editor = principal("content", ["CONTENT_EDITOR"]);

    expect(can(editor, "banner.write")).toBe(true);
    expect(can(editor, "banner.publish")).toBe(true);
    expect(can(editor, "media.write")).toBe(true);
    expect(can(editor, "seo.write.global")).toBe(true);
    expect(can(editor, "product.write")).toBe(false);
    expect(can(editor, "lead.read.all")).toBe(false);
    expect(can(editor, "analytics.read.summary")).toBe(false);
    expect(can(editor, "analytics.read.visitors")).toBe(false);
    expect(can(editor, "analytics.export")).toBe(false);
  });

  it("allows Sales to access only currently assigned leads", () => {
    const sales = principal("sales-1", ["SALES"]);

    expect(can(sales, "lead.read.assigned", { assigneeId: "sales-1", assignmentActive: true })).toBe(true);
    expect(can(sales, "lead.update.assigned", { assigneeId: "sales-1", assignmentActive: true })).toBe(true);
    expect(can(sales, "lead.export.assigned", { assigneeId: "sales-1", assignmentActive: true })).toBe(true);
    expect(can(sales, "lead.read.assigned", { assigneeId: "sales-2", assignmentActive: true })).toBe(false);
    expect(can(sales, "lead.read.assigned", { assigneeId: "sales-1", assignmentActive: false })).toBe(false);
    expect(can(sales, "lead.assign")).toBe(false);
    expect(can(sales, "analytics.read.summary")).toBe(false);
    expect(can(sales, "analytics.read.visitors")).toBe(false);
    expect(can(sales, "analytics.export")).toBe(false);
  });

  it("limits Support Agents to their currently assigned conversations", () => {
    const agent = principal("agent-1", ["SUPPORT_AGENT"]);

    expect(can(agent, "chat.read.assigned", { chatAssigneeId: "agent-1", chatAssignmentActive: true })).toBe(true);
    expect(can(agent, "chat.reply.assigned", { chatAssigneeId: "agent-1", chatAssignmentActive: true })).toBe(true);
    expect(can(agent, "chat.read.assigned", { chatAssigneeId: "agent-2", chatAssignmentActive: true })).toBe(false);
    expect(can(agent, "chat.reply.assigned", { chatAssigneeId: "agent-1", chatAssignmentActive: false })).toBe(false);
    expect(can(agent, "chat.read.all")).toBe(false);
    expect(can(agent, "chat.assign")).toBe(false);
    expect(can(agent, "chat.manage")).toBe(false);
  });

  it("lets Support Supervisors view, reply, assign, and manage every conversation", () => {
    const supervisor = principal("supervisor-1", ["SUPPORT_SUPERVISOR"]);

    expect(can(supervisor, "chat.read.all")).toBe(true);
    expect(can(supervisor, "chat.reply.all")).toBe(true);
    expect(can(supervisor, "chat.assign")).toBe(true);
    expect(can(supervisor, "chat.manage")).toBe(true);
    expect(can(supervisor, "user.manage")).toBe(false);
    expect(can(supervisor, "lead.read.all")).toBe(false);
  });

  it("gives administrators all chat permissions without expanding editor access", () => {
    const admin = principal("admin", ["ADMIN"]);
    const editor = principal("content", ["CONTENT_EDITOR"]);

    for (const permission of ["chat.read.all", "chat.reply.all", "chat.assign", "chat.manage"] as const) {
      expect(can(admin, permission)).toBe(true);
      expect(can(editor, permission)).toBe(false);
    }
  });

  it("denies unknown permissions by default", () => {
    const admin = principal("admin", ["ADMIN"]);

    expect(can(admin, "unknown.action" as Permission)).toBe(false);
  });
});

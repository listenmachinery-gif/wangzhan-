export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PRODUCT_EDITOR",
  "CONTENT_EDITOR",
  "SALES",
  "SALES_MANAGER",
  "CRM_VIEWER",
  "SUPPORT_AGENT",
  "SUPPORT_SUPERVISOR",
] as const;

export type RoleKey = (typeof ROLES)[number];

export const PERMISSIONS = [
  "role.manage",
  "security.manage",
  "user.manage",
  "settings.write",
  "page.read",
  "page.write",
  "page.publish",
  "navigation.read",
  "navigation.write",
  "navigation.publish",
  "shipping.read",
  "shipping.write",
  "shipping.publish",
  "category.read",
  "category.write",
  "category.publish",
  "product.read",
  "product.write",
  "product.publish",
  "specification.read",
  "specification.write",
  "specification.publish",
  "media.read",
  "media.write",
  "media.delete",
  "banner.read",
  "banner.write",
  "banner.publish",
  "seo.read",
  "seo.write.product",
  "seo.write.global",
  "seo.publish",
  "lead.read.all",
  "lead.read.assigned",
  "lead.read.team",
  "lead.update.all",
  "lead.update.assigned",
  "lead.update.team",
  "lead.assign",
  "lead.assign.team",
  "lead.export.all",
  "lead.export.assigned",
  "lead.export.team",
  "customer.read",
  "customer.create",
  "customer.update",
  "customer.delete",
  "inquiry.create",
  "inquiry.update",
  "inquiry.assign",
  "analytics.read.summary",
  "analytics.read.visitors",
  "analytics.export",
  "analytics.delete",
  "chat.read.assigned",
  "chat.read.all",
  "chat.reply.assigned",
  "chat.reply.all",
  "chat.assign",
  "chat.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type Principal = {
  id: string;
  email: string;
  name: string;
  roles: RoleKey[];
};

export type PermissionResource = {
  assigneeId?: string | null;
  assignmentActive?: boolean;
  chatAssigneeId?: string | null;
  chatAssignmentActive?: boolean;
  targetRoles?: RoleKey[];
};

const allPermissions = Object.fromEntries(PERMISSIONS.map((permission) => [permission, true])) as Record<
  Permission,
  true
>;

function allow(...permissions: Permission[]) {
  return Object.fromEntries(permissions.map((permission) => [permission, true])) as Partial<
    Record<Permission, true>
  >;
}

export const ROLE_PERMISSIONS: Record<RoleKey, Partial<Record<Permission, true>>> = {
  SUPER_ADMIN: allPermissions,
  ADMIN: allow(
    "user.manage",
    "settings.write",
    "page.read",
    "page.write",
    "page.publish",
    "navigation.read",
    "navigation.write",
    "navigation.publish",
    "shipping.read",
    "shipping.write",
    "shipping.publish",
    "category.read",
    "category.write",
    "category.publish",
    "product.read",
    "product.write",
    "product.publish",
    "specification.read",
    "specification.write",
    "specification.publish",
    "media.read",
    "media.write",
    "media.delete",
    "banner.read",
    "banner.write",
    "banner.publish",
    "seo.read",
    "seo.write.product",
    "seo.write.global",
    "seo.publish",
    "lead.read.all",
    "lead.update.all",
    "lead.assign",
    "lead.export.all",
    "customer.read",
    "customer.create",
    "customer.update",
    "customer.delete",
    "inquiry.create",
    "inquiry.update",
    "inquiry.assign",
    "analytics.read.summary",
    "analytics.read.visitors",
    "analytics.export",
    "analytics.delete",
    "chat.read.all",
    "chat.reply.all",
    "chat.assign",
    "chat.manage",
  ),
  PRODUCT_EDITOR: allow(
    "category.read",
    "category.write",
    "category.publish",
    "product.read",
    "product.write",
    "product.publish",
    "specification.read",
    "specification.write",
    "specification.publish",
    "media.read",
    "media.write",
    "seo.read",
    "seo.write.product",
  ),
  CONTENT_EDITOR: allow(
    "page.read",
    "page.write",
    "page.publish",
    "navigation.read",
    "navigation.write",
    "navigation.publish",
    "shipping.read",
    "shipping.write",
    "shipping.publish",
    "media.read",
    "media.write",
    "banner.read",
    "banner.write",
    "banner.publish",
    "seo.read",
    "seo.write.global",
    "seo.publish",
  ),
  SALES: allow(
    "lead.read.assigned",
    "lead.update.assigned",
    "lead.export.assigned",
    "customer.read",
    "customer.update",
    "inquiry.update",
    "chat.read.assigned",
    "chat.reply.assigned",
  ),
  SALES_MANAGER: allow(
    "lead.read.team",
    "lead.update.team",
    "lead.export.team",
    "lead.assign.team",
    "customer.read",
    "customer.create",
    "customer.update",
    "inquiry.create",
    "inquiry.update",
    "inquiry.assign",
  ),
  CRM_VIEWER: allow("lead.read.team", "customer.read"),
  SUPPORT_AGENT: allow(
    "chat.read.assigned",
    "chat.reply.assigned",
  ),
  SUPPORT_SUPERVISOR: allow(
    "chat.read.all",
    "chat.reply.all",
    "chat.assign",
    "chat.manage",
  ),
};

const assignedLeadPermissions = new Set<Permission>([
  "lead.read.assigned",
  "lead.update.assigned",
  "lead.export.assigned",
]);

const assignedChatPermissions = new Set<Permission>([
  "chat.read.assigned",
  "chat.reply.assigned",
]);

export function can(principal: Principal, permission: Permission, resource: PermissionResource = {}) {
  if (!PERMISSIONS.includes(permission)) {
    return false;
  }

  const allowed = principal.roles.some((role) => ROLE_PERMISSIONS[role]?.[permission] === true);

  if (!allowed) {
    return false;
  }

  if (permission === "user.manage" && !principal.roles.includes("SUPER_ADMIN")) {
    return !resource.targetRoles?.includes("SUPER_ADMIN");
  }

  if (assignedLeadPermissions.has(permission) && !principal.roles.includes("SUPER_ADMIN")) {
    return resource.assignmentActive === true && resource.assigneeId === principal.id;
  }

  if (assignedChatPermissions.has(permission) && !principal.roles.includes("SUPER_ADMIN")) {
    return resource.chatAssignmentActive === true && resource.chatAssigneeId === principal.id;
  }

  return true;
}

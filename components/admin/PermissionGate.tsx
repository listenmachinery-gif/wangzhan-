import type { ReactNode } from "react";

import { can, type Permission, type PermissionResource, type Principal } from "@/lib/auth/permissions";

export function PermissionGate({
  principal,
  permission,
  resource,
  children,
}: {
  principal: Principal;
  permission: Permission;
  resource?: PermissionResource;
  children: ReactNode;
}) {
  return can(principal, permission, resource) ? children : null;
}

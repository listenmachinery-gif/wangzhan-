import "server-only";

import { can, type Permission, type PermissionResource } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";

export class AuthenticationRequiredError extends Error {}
export class PermissionDeniedError extends Error {}

export async function requirePermission(permission: Permission, resource?: PermissionResource) {
  const principal = await getCurrentPrincipal();
  if (!principal) throw new AuthenticationRequiredError("Authentication required.");
  if (!can(principal, permission, resource)) throw new PermissionDeniedError("Permission denied.");
  return principal;
}

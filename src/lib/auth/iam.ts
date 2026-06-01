/**
 * PRODUCTION-GRADE AUTHORIZATION SERVICE
 * Inspired by AWS IAM and GitHub Permissions.
 */

export type Role =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "WORKSPACE_ADMIN"
  | "DEVELOPER"
  | "EDITOR"
  | "EXECUTOR"
  | "VIEWER"
  | "AUDITOR";

export type Permission =
  | "workflow:create"
  | "workflow:edit"
  | "workflow:publish"
  | "workflow:execute"
  | "workflow:delete"
  | "credential:manage"
  | "runtime:manage"
  | "organization:manage"
  | "audit:view";

/**
 * Hierarchical Role Inheritance
 * SUPER_ADMIN inherits everything.
 */
const ROLE_HIERARCHY: Record<Role, Role[]> = {
  SUPER_ADMIN: ["ORG_ADMIN", "WORKSPACE_ADMIN", "DEVELOPER", "EDITOR", "EXECUTOR", "VIEWER", "AUDITOR"],
  ORG_ADMIN: ["WORKSPACE_ADMIN", "DEVELOPER", "EDITOR", "EXECUTOR", "VIEWER", "AUDITOR"],
  WORKSPACE_ADMIN: ["DEVELOPER", "EDITOR", "EXECUTOR", "VIEWER"],
  DEVELOPER: ["EDITOR", "EXECUTOR", "VIEWER"],
  EDITOR: ["VIEWER"],
  EXECUTOR: ["VIEWER"],
  VIEWER: [],
  AUDITOR: ["VIEWER"],
};

/**
 * Base Permission Mapping
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "workflow:create", "workflow:edit", "workflow:publish", "workflow:execute", "workflow:delete",
    "credential:manage", "runtime:manage", "organization:manage", "audit:view"
  ],
  ORG_ADMIN: [
    "workflow:create", "workflow:edit", "workflow:publish", "workflow:execute", "workflow:delete",
    "credential:manage", "runtime:manage", "organization:manage", "audit:view"
  ],
  WORKSPACE_ADMIN: [
    "workflow:create", "workflow:edit", "workflow:publish", "workflow:execute", "workflow:delete",
    "credential:manage", "runtime:manage"
  ],
  DEVELOPER: [
    "workflow:create", "workflow:edit", "workflow:execute", "runtime:manage"
  ],
  EDITOR: [
    "workflow:create", "workflow:edit"
  ],
  EXECUTOR: [
    "workflow:execute"
  ],
  VIEWER: [],
  AUDITOR: [
    "audit:view"
  ],
};

/**
 * Dynamic Permission Resolver
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  // Check direct permissions
  if (ROLE_PERMISSIONS[role].includes(permission)) return true;

  // Check inherited permissions
  const inheritedRoles = ROLE_HIERARCHY[role];
  return inheritedRoles.some(inheritedRole => ROLE_PERMISSIONS[inheritedRole].includes(permission));
}

/**
 * Membership Management Guard
 * Enforces that only Admins can change roles, and Admin roles themselves are immutable.
 */
export function canModifyMembership(
  callerRole: Role,
  targetRole: Role,
  newRole?: Role
): { allowed: boolean; reason?: string } {
  // 1. Only Org/Super Admins can manage memberships
  const isAdmin = callerRole === "ORG_ADMIN" || callerRole === "SUPER_ADMIN";
  if (!isAdmin) {
    return { allowed: false, reason: "Only Organization or Super Admins can manage roles." };
  }

  // 2. Protect existing Admin roles (Immutable Admin Rule)
  const isTargetAdmin = targetRole === "ORG_ADMIN" || targetRole === "SUPER_ADMIN";
  if (isTargetAdmin) {
    return { allowed: false, reason: "Administrator roles are immutable and cannot be changed." };
  }

  // 3. Prevent demoting to/from Admin (Double-check for safety)
  if (newRole && (newRole === "ORG_ADMIN" || newRole === "SUPER_ADMIN")) {
    // Only a Super Admin can promote someone to Org Admin
    if (callerRole !== "SUPER_ADMIN") {
      return { allowed: false, reason: "Only a Super Admin can promote users to Administrator levels." };
    }
  }

  return { allowed: true };
}

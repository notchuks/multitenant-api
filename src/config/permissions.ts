import { P } from "pino";

export const ALL_PERMISSIONS = [
  // users
  "users:roles:write",  // Allowed to add a role to a user
  "users:roles:delete",  // Allowed to remove a role to a user

  // posts
  "posts:write",
  "posts:read",
  "posts:delete"
] as const;

export const PERMISSIONS = ALL_PERMISSIONS.reduce((acc, permission) => {
  acc[permission] = permission;

  return acc;
}, {} as Record<(typeof ALL_PERMISSIONS)[number], (typeof ALL_PERMISSIONS)[number]>)

export const USER_ROLE_PERMISSIONS = [
  PERMISSIONS["posts:write"],
  PERMISSIONS["posts:read"],
];

export const SYSTEM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  APPLICATION_USER: "APPLICATION_USER",
};
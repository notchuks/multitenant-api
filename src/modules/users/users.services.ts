import { InferInsertModel, and, eq } from "drizzle-orm";
import argon2 from "argon2";
import { applications, roles, users, usersToRoles } from "../../db/schema";
import { db } from "../../db";

export async function createUser(data: InferInsertModel<typeof users>) {
  const hashedPassword = await argon2.hash(data.password);

  const result = await db
    .insert(users)
    .values({ ...data, password: hashedPassword })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      applicationId: applications.id,
    });

  return result[0];
}

export async function getUsersByApplication(applicationId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.applicationId, applicationId));

  return result;
}

export async function getUsersByEmail({
  email,
  applicationId,
}: {
  email: string;
  applicationId: string;
}) {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      password: users.password,
      applicationId: users.applicationId,
      roleId: roles.id,
      permissions: roles.permissions,
    })
    .from(users)
    .where(and(eq(users.email, email), eq(users.applicationId, applicationId)))
    // LEFT JOIN
    // from usersToRoles
    // ON usersToRoles.userId = users.id
    // AND usersToRoles.applicationId = users.applicationId
    .leftJoin(usersToRoles, and(
      eq(usersToRoles.userId, users.id),
      eq(usersToRoles.applicationId, users.applicationId)
    ))
    // LEFT JOIN
    // from roles
    // ON roles.id = usersToRoles.roleId
    .leftJoin(roles, eq(roles.id, usersToRoles.roleId));

    if(!result.length) {
      return null;
    }

    const user = result.reduce((acc, curr) => {

      if(!acc.id) {
        return {
          ...curr,
          permissions: new Set(curr.permissions),
        }
      }

      if(!curr.permissions) {
        return acc;
      }

      for (const permission in curr.permissions) {
        acc.permissions.add(permission);
      }

      return acc;
    }, {} as Omit<(typeof result)[number], "permissions"> & {"permissions": Set<string>});

    // We used reduce to convert the permissions to a set, with the aim of removing duplicate permissions.
    // then we convert the set back to an array before returning.
    return { ...user, permissions: Array.from(user.permissions) };
}

export async function assignRoleToUser(
  data: InferInsertModel<typeof usersToRoles>
) {
  const result = await db.insert(usersToRoles).values(data).returning();

  return result[0];
}

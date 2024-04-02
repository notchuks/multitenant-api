import { pgTable, uuid, timestamp, varchar, primaryKey, uniqueIndex, text } from "drizzle-orm/pg-core";

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  applicationId: uuid("applicationId").references(() => applications.id),
  password: varchar("password", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (users) => {
  return {
    cpk: primaryKey({ columns: [users.email, users.applicationId] }), // switched from deprecated primaryKey(users.email, users.applicationId)
    idIndex: uniqueIndex("users_id_index").on(users.id),
  };
})

/**
 * On the schema above, a primary key is always unique. Our multitenant app is one that multiple apps can exist in
 * (like shopify or slack), so a user can create different accounts in different applications with the same user info.
 * Therefore, our composite primary key consists of a users email & the application id he created the account in.
 * The users's email doesnt have to be unique (as he can create multple acounts in different apps), but the combination
 * of his email & applicationId have to be unique.
 */

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  applicationId: uuid("applicationId").references(() => applications.id),
  permissions: text("permissions").array().$type<Array<string>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (roles) => {
  return {
    cpk: primaryKey({ columns: [roles.name, roles.applicationId] }),
    idIndex: uniqueIndex("roles_id_index").on(roles.id),
  };
})


// Assigns a role to a user inside an application

export const usersToRoles = pgTable("usersToRoles", {
  applicationId: uuid("applicationId").references(() => applications.id).notNull(),
  roleId: uuid("roleId").references(() => roles.id).notNull(),
  userId: uuid("userId").references(() => users.id).notNull(),
}, (usersToRoles) => {
  return {
    cpk: primaryKey({ columns: [usersToRoles.applicationId, usersToRoles.roleId, usersToRoles.userId] }),
  }
});


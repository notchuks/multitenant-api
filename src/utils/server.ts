import fastify from "fastify";
import guard from "fastify-guard";
import { logger } from "./logger";
import { applicationRoutes } from "../modules/applications/applications.routes";
import { usersRoutes } from "../modules/users/users.routes";
import { roleRoutes } from "../modules/roles/roles.routes";
import { verifyJwt } from "./jwt.utils";

export type UserDetails = {
  id: string;
  applicationId: string;
  scopes: Array<string>;
};

export type User = {
  valid: boolean;
  expired: boolean;
  decoded: UserDetails | null;
};

// Tell Fastify's types that a user is going to be on every request
declare module "fastify" {
  interface FastifyRequest {
    user: User;
  }
}

export async function buildServer() {
  const app = fastify({
    logger, // logger: logger,
  });

  // since null is an object, this is dummy data to keep typescript happy
  app.decorateRequest("user", null);

  app.addHook("onRequest", async function (request, reply) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    try {
      const token = authHeader.replace("Bearer ", "");
      const decoded = verifyJwt(token);
      console.log(decoded);
      request.user = decoded;
    } catch (e) {}
  });

  // register plugins
  app.register(guard, {
    requestProperty: "user",
    scopeProperty: "decoded.scopes", // This means to look for user.scopes in each request and check which permissions are there
    errorHandler: (result, request, reply) => {
      return reply.send("you can not do that");
    },
  });

  // register routes
  app.register(applicationRoutes, { prefix: "/api/applications" });
  app.register(usersRoutes, { prefix: "api/users" });
  app.register(roleRoutes, { prefix: "api/roles" });

  return app;
}

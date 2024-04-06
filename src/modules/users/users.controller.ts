import { FastifyReply, FastifyRequest } from "fastify";
import { AssignRoleToUserBody, CreateUserBody, LoginBody } from "./users.schemas";
import { SYSTEM_ROLES } from "../../config/permissions";
import { getRoleByName } from "../roles/roles.services";
import { assignRoleToUser, createUser, getUsersByApplication, getUsersByEmail } from "./users.services";
import { signJwt } from "../../utils/jwt.utils";
import { logger } from "../../utils/logger";

export async function createUserHandler(request: FastifyRequest<{ Body: CreateUserBody }>, reply: FastifyReply) {
  const { initialUser, ...data } = request.body;
  console.log({ initialUser });

  const roleName = initialUser ? SYSTEM_ROLES.SUPER_ADMIN : SYSTEM_ROLES.APPLICATION_USER;
  console.log({ roleName });

  if(roleName === SYSTEM_ROLES.SUPER_ADMIN) {
    const appUsers = await getUsersByApplication(data.applicationId);

    if(appUsers.length > 0) {
      return reply.code(400).send({
        message: "Application already has super admin user",
        extensions: {
          code: "APPLICATION_ALREADY_SUPER_USER",
          applicationId: data.applicationId,
        },
      });
    }
  };

  const role = await getRoleByName({
    name: roleName,
    applicationId: data.applicationId,
  });
  console.log({ role });

  if(!role) {
    return reply.code(404).send({
      message: "Role not found",
    })
  }

  try {
    const user = await createUser(data);

    // Assign role to user
    await assignRoleToUser({ applicationId: data.applicationId, roleId: role.id, userId: user.id });

    return user;
  } catch (error) {
    
  }
}

export async function loginHandler(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {

  const { applicationId, email, password } = request.body;

  const user = await getUsersByEmail({ applicationId, email });

  if(!user) {
    return reply.code(400).send({
      message: "Invalid email or password",
    });
  }

  const accessToken = signJwt({ id: user.id, email, applicationId, scopes: user.permissions }, { expiresIn: "15m" });
  // console.log(accessToken);
  return { accessToken };
}

export async function assignRoleToUserHandler(request: FastifyRequest<{ Body: AssignRoleToUserBody }>, reply: FastifyReply) {
  // im sure applicationId will always be present here due to request hooks before the request
  const applicationId = request.user.decoded?.applicationId as string;
  const { userId, roleId } = request.body;

  try {
    const result = await assignRoleToUser({ userId, roleId, applicationId });
    return result;
  } catch (e) {
    logger.error(e, "error assigning role to user.");
    return reply.code(400).send({
      message: "could not assign role to user",
    })
  }
}
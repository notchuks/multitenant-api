import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const createApplicationBodySchema = z.object({
  name: z.string({
    required_error: "Name is required"
  })
});

export type createApplicationBody = z.infer<typeof createApplicationBodySchema>;

// Fastify takes a JSON schema, unlike express that takes a regular object.
export const createApplicationJsonSchema = {
  body: zodToJsonSchema(createApplicationBodySchema, "createApplicationBodySchema"),
}
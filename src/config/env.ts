import zennv from "zennv"; // get environment variables using a zod configuration, tom created this. Find battle-tested alternatives
import { z } from "zod";

export const env = zennv({
  dotenv: true,
  schema: z.object({
    PORT: z.number().default(3000),
    HOST: z.string().default("0.0.0.0"),
    DATABASE_CONNECTION: z.string(),
    PUBLIC_KEY: z.string(),
    PRIVATE_KEY: z.string(),
  }),
});
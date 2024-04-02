import pino from "pino";

export const logger = pino({
  redact: ["DATABASE_CONNECTION", "PUBLIC_KEY", "PRIVATE_KEY"],
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
});
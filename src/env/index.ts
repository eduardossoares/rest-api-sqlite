import { config } from "dotenv";
import z from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
} else config({ path: ".env" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  DATABASE_CLIENT: z.enum(["sqlite", "pg"]),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.log(`Invalid envorinments variables: ${_env.error.format()}`);
  throw new Error("Invalid envorinments variables");
}

export const env = _env.data;

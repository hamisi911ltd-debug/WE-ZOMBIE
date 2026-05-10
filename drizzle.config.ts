import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/backend/lib/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
});

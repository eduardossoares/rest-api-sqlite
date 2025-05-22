import fastify from "fastify";
import cookie from "@fastify/cookie";
import crypto from "node:crypto";
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";
import { summaryRoutes } from "./routes/summary";

const app = fastify();

app.register(cookie);
app.register(transactionsRoutes, {
  prefix: "transactions",
});
app.register(summaryRoutes, {
  prefix: "/summary",
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("Server running on port", env.PORT);
  });

export { app };

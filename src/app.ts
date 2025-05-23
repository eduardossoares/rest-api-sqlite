import fastify from "fastify";
import cookie from "@fastify/cookie";
import { summaryRoutes } from "./routes/summary";
import { transactionsRoutes } from "./routes/transactions";

const app = fastify();

app.register(cookie);
app.register(summaryRoutes, { prefix: "/summary" });
app.register(transactionsRoutes, { prefix: "/transactions" });

export { app };

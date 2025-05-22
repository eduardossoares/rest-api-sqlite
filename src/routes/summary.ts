import { FastifyInstance } from "fastify";
import { database } from "../configs/db";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export const summaryRoutes = async (app: FastifyInstance) => {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async req => {
      const { sessionId } = req.cookies;
      const summary = await database("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();
      return {
        summary,
      };
    }
  );
};

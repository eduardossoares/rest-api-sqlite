import crypto from "node:crypto";
import { FastifyInstance } from "fastify";
import { database } from "../configs/db";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import z from "zod";
export const transactionsRoutes = async (app: FastifyInstance) => {
  app.addHook("preHandler", async req => {
    console.log(`[${req.method}] ${req.url}`);
  });

  app.post("/", async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { amount, title, type } = createTransactionBodySchema.parse(req.body);
    let { sessionId } = req.cookies;

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      res.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    await database("transactions").insert({
      id: crypto.randomUUID(),
      session_id: sessionId,
      amount: type === "credit" ? amount : amount * -1,
      title,
    });

    return res.status(201).send();
  });

  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async req => {
      const { sessionId } = req.cookies;

      const transactions = await database("transactions").where(
        "session_id",
        sessionId
      );
      return {
        transactions,
      };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async req => {
      const { sessionId } = req.cookies;

      const selectTransactionByIdSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = selectTransactionByIdSchema.parse(req.params);

      const transaction = await database("transactions")
        .where({
          session_id: sessionId,
          id,
        })
        .first();
      return {
        transaction,
      };
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const { sessionId } = req.cookies;

      const deleteTransactionByIdSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = deleteTransactionByIdSchema.parse(req.params);

      await database("transactions")
        .where({
          session_id: sessionId,
          id,
        })
        .delete();

      return res.status(204).send();
    }
  );
};

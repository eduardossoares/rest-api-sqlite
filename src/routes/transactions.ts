import crypto from "node:crypto";
import { FastifyInstance } from "fastify";
import { database } from "../configs/db";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import z from "zod";
export const transactionsRoutes = async (app: FastifyInstance) => {
  app.addHook("preHandler", async (req, res) => {
    console.log(`[${req.method}] ${req.url}`);
  });

  app.post("/", async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { amount, title, type } = createTransactionBodySchema.parse(req.body);

    const { sessionId } = req.cookies;

    await database("transactions").insert({
      id: crypto.randomUUID(),
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
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

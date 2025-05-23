import { it, beforeAll, afterAll, describe, expect, beforeEach } from "vitest";
import { execSync } from "node:child_process";
import { app } from "../src/app";
import supertest from "supertest";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex -- migrate:rollback --all");
    execSync("npm run knex -- migrate:latest");
  });

  it("should must be able to create a new transaction", async () => {
    await supertest(app.server)
      .post("/transactions")
      .send({
        title: "Transaction test",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionResponse = await supertest(app.server)
      .post("/transactions")
      .send({
        title: "Transaction test",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    if (!cookies) throw new Error("Cookies not found");

    const sessionId = cookies[0].split(";")[0];

    const listTransactionsResponse = await supertest(app.server)
      .get("/transactions")
      .set("Cookie", sessionId)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "Transaction test",
        amount: 5000,
      }),
    ]);
  });

  it("should be able to get a specific transaction", async () => {
    const createTransactionResponse = await supertest(app.server)
      .post("/transactions")
      .send({
        title: "Transaction test",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const cookies = createTransactionResponse.get("Set-Cookie");

    if (!cookies) throw new Error("Cookies not found");

    const sessionId = cookies[0].split(";")[0];

    const listTransactionResponse = await supertest(app.server)
      .get("/transactions")
      .set("Cookie", sessionId)
      .expect(200);

    const transactionId = listTransactionResponse.body.transactions[0].id;

    const getTransactionId = await supertest(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", sessionId)
      .expect(200);

    expect(getTransactionId.body.transaction).toEqual(
      expect.objectContaining({
        title: "Transaction test",
        amount: 5000,
      })
    );
  });
});

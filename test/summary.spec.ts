import { it, beforeAll, afterAll, expect, describe, beforeEach } from "vitest";
import { execSync } from "node:child_process";
import supertest from "supertest";
import { app } from "../src/app";

describe("Sumarry routes", () => {
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

  it("should be able to get summary", async () => {
    const createCreditTransactionResponse = await supertest(app.server)
      .post("/transactions")
      .send({
        title: "Credit test",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const cookies = createCreditTransactionResponse.get("Set-Cookie");

    if (!cookies) throw new Error("Cookies not found");
    const sessionId = cookies[0].split(";")[0];

    await supertest(app.server)
      .post("/transactions")
      .send({
        title: "Debit test",
        amount: 1500,
        type: "debit",
      })
      .set("Cookie", sessionId)
      .expect(201);

    const summaryResponse = await supertest(app.server)
      .get("/summary")
      .set("Cookie", sessionId)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 3500,
    });
  });
});

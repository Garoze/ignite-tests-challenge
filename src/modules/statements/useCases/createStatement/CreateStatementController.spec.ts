import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import request from "supertest";
import { app } from "../../../../app";

import getConnection from "../../../../database/";

import { Connection } from "typeorm"

let connection: Connection;

describe("CreateStatement", () => {
  beforeAll(async () => {
    connection = await getConnection("localhost");
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at) 
      values('${id}', 'admin', 'admin@finapi.com', '${password}', 'now()')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to make a deposit", async () => {
    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com",
        password: "admin"
      })

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "DepositTestStatement"
      })
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body.amount).toEqual(200);
    expect(response.body.type).toEqual("deposit");
  })

  it("should be able to withdraw", async () => {
    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com",
        password: "admin"
      })

     await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "DepositTestStatement"
      })
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 150,
        description: "WithdrawTestStatement"
      })
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body.amount).toEqual(150);
    expect(response.body.type).toEqual("withdraw");
  })

  it("should not be able to withdraw if not enough funds", async () => {
    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com",
        password: "admin"
      })

     await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "DepositTestStatement"
      })
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "WithdrawTestStatement"
      })
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("Insufficient funds");
  })
})


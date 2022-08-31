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

  it("should be able to view an user balance", async () => {
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
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })
    
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toEqual(400);
  })

  it("should not be able to view a balance of an invalid user", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer invalid`
      })

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("JWT invalid token!");
  })
})

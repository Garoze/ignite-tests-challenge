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

  it("should be able to view an valid operation", async () => {
    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com",
        password: "admin"
      })

    const statementReponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "DepositTestStatement"
      })
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })
    
    const response = await request(app)
      .get(`/api/v1/statements/${statementReponse.body.id}`)
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body.id).toEqual(statementReponse.body.id);
    expect(response.body.user_id).toEqual(authResponse.body.user.id);
  })

  it("shoudl not be able to view an operation of an invalid user", async () => {
    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com",
        password: "admin"
      })

    const statementReponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "DepositTestStatement"
      })
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })
    
    const response = await request(app)
      .get(`/api/v1/statements/${statementReponse.body.id}`)
      .set({
        Authorization: `Bearer invalid`
      })
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("JWT invalid token!");
  })

  it("should not be able to view an operation of an invalid statement_id", async () => {
    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com",
        password: "admin"
      })

    const invalidStatementId = "a37dff33-c7bc-438c-8652-04a6a1026838";
    
    const response = await request(app)
      .get(`/api/v1/statements/${invalidStatementId}`)
      .set({
        Authorization: `Bearer ${authResponse.body.token}`
      })
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("Statement not found");
  })
})

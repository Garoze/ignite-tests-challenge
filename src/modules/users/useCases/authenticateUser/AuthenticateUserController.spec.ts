import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import request from "supertest";
import { app } from "../../../../app";

import getConnection from "../../../../database/";

import { Connection } from "typeorm"

let connection: Connection;

describe("AuthenticateUserController", () => {
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

  it("should be able to authenticate a valid user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com",
        password: "admin"
      })

    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a user with an invalid password", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com",
        password: "invalidpass"
      })

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toEqual("Incorrect email or password");
  });
});

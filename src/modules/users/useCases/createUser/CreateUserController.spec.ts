import request from "supertest";
import { Connection } from "typeorm"

import { app } from "../../../../app";

import getConnection from "../../../../database/";

let connection: Connection;

describe("AuthenticateUserController", () => {
  beforeAll(async () => {
    connection = await getConnection("localhost");
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to create a new user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "TestUserController",
        email: "test@email.com",
        password: "testpass"
      })

    expect(response.status).toBe(201);
  })

  it("should not be able to create an user if already exists", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "TestUserController",
        email: "test@email.com",
        password: "testpass"
      })

    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "TestUserController",
        email: "test@email.com",
        password: "testpass"
      })

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("User already exists");
  })
});

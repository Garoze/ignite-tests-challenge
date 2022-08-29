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

  it("should be able to view a user profile", async () => {
    const createUserResponse = await request(app)
      .post("/api/v1/users")
      .send({
        name: "TestUserController",
        email: "test@email.com",
        password: "testpass"
      })

    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@email.com",
        password: "testpass"
      })

    expect(createUserResponse.status).toBe(201);
    expect(authResponse.body).toHaveProperty("token");

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${authResponse.body.token}` 
      })

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(authResponse.body.user.id);
  })
});

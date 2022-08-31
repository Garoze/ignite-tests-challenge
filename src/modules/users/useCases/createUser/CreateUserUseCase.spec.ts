import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"
import { ICreateUserDTO } from "./ICreateUserDTO";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("CreateUserUseCase", () => {
  beforeEach(async () => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
  })

  it("should be able to create a new user", async () => {
    const newUser: ICreateUserDTO = {
      name: "TestUser",
      email: "test@email.com",
      password: "testpass"
    }
  
    const response = await createUserUseCase.execute(newUser);

    expect(response).toHaveProperty("id");
  })

  it("should not be able to create an user if already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "TestUser1",
        email: "test@email.com",
        password: "testpass"
      })

      await createUserUseCase.execute({
        name: "TestUser2",
        email: "test@email.com",
        password: "otherpass"
      })
    }).rejects.toBeInstanceOf(CreateUserError);
  })
})

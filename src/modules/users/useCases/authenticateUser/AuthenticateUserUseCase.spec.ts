import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"

let inMemoryUserRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("AuthenticateUser", () => {
  beforeEach(async () => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUserRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
  })

  it("should be able to authenticate a valid user", async () => {
    const newUser: ICreateUserDTO = {
      name: "NewUser Test",
      email: "newuser@email.com",
      password: "12345",
    }
    
    await createUserUseCase.execute(newUser);
    
    const response = await authenticateUserUseCase.execute({
      email: newUser.email,
      password: newUser.password
    })

    expect(response).toHaveProperty("token");
  }) 
})

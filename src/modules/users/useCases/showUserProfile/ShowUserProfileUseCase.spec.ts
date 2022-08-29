import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("ShowUserProfile", () => {
  beforeEach(async () => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUserRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUserRepository);
  })

  it("should be able to view a user profile", async () => {
    await createUserUseCase.execute({
      name: "TestUser",
      email: "test@email.com",
      password: "testpass"
    })

    const authResponse = await authenticateUserUseCase.execute({
      email: "test@email.com",
      password: "testpass"
    })

    const response = await showUserProfileUseCase.execute(authResponse.user.id as string);

    expect(authResponse).toHaveProperty("token");
    expect(response).toHaveProperty("id");
    expect(response.id).toEqual(authResponse.user.id);
  })

  it("should not be able to view a profile of an nonexistent user", async () => {
    expect(async () => {
      const user_id = "invalid";

      await showUserProfileUseCase.execute(user_id);
    }).rejects.toBeInstanceOf(AppError);
  })
})


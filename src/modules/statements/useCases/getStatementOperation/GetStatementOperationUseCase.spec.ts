import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let inMemoryStatementRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("GetStatementOperation", () => {
  beforeEach(async () => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUserRepository,
      inMemoryStatementRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUserRepository,
      inMemoryStatementRepository
    )
    createUserUseCase = new CreateUserUseCase(
      inMemoryUserRepository
    )
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUserRepository
    )
  })

  it("should be able to view a valid statement operation", async() => {
    const user = await createUserUseCase.execute({
      name: "TestUser",
      email: "test@email.com",
      password: "testpass"
    }) 

    const authResponse = await authenticateUserUseCase.execute({
      email: "test@email.com",
      password: "testpass"
    })
    
    const statement = await createStatementUseCase.execute({
      amount: 200,
      description: "DepositTestStatement",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    const response = await getStatementOperationUseCase.execute({
      user_id: authResponse.user.id as string,
      statement_id: statement.id as string, 
    })

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("user_id");
    expect(response.id).toEqual(statement.id);
    expect(response.user_id).toEqual(authResponse.user.id);
  })

  it("should not be able to view an operation of an invalid user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "invalid",
        statement_id: "somestatement", 
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  })

  it("should not be able to view an operation of an invalid statement_id", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "UserTest",
        email: "testuser@email.com",
        password: "somepass"
      })

      const authResponse = await authenticateUserUseCase.execute({
        email: "testuser@email.com",
        password: "somepass"
      })

      await getStatementOperationUseCase.execute({
        user_id: authResponse.user.id as string,
        statement_id: "invalid", 
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })
})

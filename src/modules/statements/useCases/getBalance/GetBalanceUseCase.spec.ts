import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("GetBalance", () => {
  beforeAll(async () => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUserRepository,
      inMemoryStatementsRepository
    )
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUserRepository
    )
  })

  it("should be able to get an user balance", async () => {
    const user = await createUserUseCase.execute({
      name: "TestUser",
      email: "test@email.com",
      password: "testpass"
    })
  
    const dep1 = await createStatementUseCase.execute({
      amount: 200,
      description: "DepositTestStatement",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    const dep2 = await createStatementUseCase.execute({
      amount: 200,
      description: "DepositTestStatement",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })
      
    const response = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(response).toHaveProperty("statement");
    expect(response).toHaveProperty("balance");
    expect(response.statement).toEqual([dep1, dep2]);
    expect(response.balance).toEqual(dep1.amount + dep2.amount);
  })

  it("should not be able to list a balance of an invalid user", async () => {
    expect(async () => {
      const user_id = "invalid";

      await getBalanceUseCase.execute({ user_id });
    }).rejects.toBeInstanceOf(GetBalanceError);
  })
})

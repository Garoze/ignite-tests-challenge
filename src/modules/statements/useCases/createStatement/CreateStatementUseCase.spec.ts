import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("CreateStatement", () => {
  beforeEach(async () => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUserRepository,
      inMemoryStatementsRepository
    )
  })

  it("should be able to make a deposit", async () => {
    const user = await inMemoryUserRepository.create({
      name: "TestUser",
      email: "test@email.com",
      password: "testpass"
    })

    const response = await createStatementUseCase.execute({
      amount: 200,
      description: "DepositTestStatement",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("amount");
    expect(response).toHaveProperty("type");
    expect(response.amount).toEqual(200);
    expect(response.type).toEqual("deposit");
    expect(response.user_id).toEqual(user.id);
  })

  it("should not be able to make an deposit for a invalid user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 200,
        description: "DepositTestStatement",
        type: OperationType.DEPOSIT,
        user_id: "invalid"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should be able to withdraw", async () => {
    const user = await inMemoryUserRepository.create({
      name: "TestUser",
      email: "test@email.com",
      password: "testpass"
    })

    await createStatementUseCase.execute({
      amount: 200,
      description: "DepositTestStatement",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    const response = await createStatementUseCase.execute({
      amount: 150,
      description: "WithdrawTestStatement",
      type: OperationType.WITHDRAW,
      user_id: user.id as string
    })

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("amount");
    expect(response).toHaveProperty("type");
    expect(response.amount).toEqual(150);
    expect(response.type).toEqual("withdraw");
    expect(response.user_id).toEqual(user.id);
  })

  it("should not be able to withdraw if user does not have enough money", async () => {
    expect(async () => {
     const user = await inMemoryUserRepository.create({
        name: "TestUser",
        email: "test@email.com",
        password: "testpass"
      })

      await createStatementUseCase.execute({
        amount: 200,
        description: "DepositTestStatement",
        type: OperationType.DEPOSIT,
        user_id: user.id as string,
      })

     await createStatementUseCase.execute({
        amount: 250,
        description: "WithdrawTestStatement",
        type: OperationType.WITHDRAW,
        user_id: user.id as string
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })

  it("should not be able to make an withdraw for a invalid user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 200,
        description: "WithdrawTestStatement",
        type: OperationType.WITHDRAW,
        user_id: "invalid"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })
})

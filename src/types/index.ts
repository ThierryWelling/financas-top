export type User = {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export type Account = {
  id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type Transaction = {
  id: string
  description: string
  amount: number
  type: TransactionType
  date: Date
  categoryId: string
  accountId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  color?: string
  icon?: string
  type: TransactionType
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type Budget = {
  id: string
  amount: number
  period: BudgetPeriod
  categoryId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type Goal = {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: Date
  userId: string
  createdAt: Date
  updatedAt: Date
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  INVESTMENT = 'INVESTMENT',
  CASH = 'CASH',
  OTHER = 'OTHER'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum BudgetPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
} 
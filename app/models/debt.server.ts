import type { User, Debt } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Debt } from "@prisma/client";

export function getDebt({
  id,
  userId,
}: Pick<Debt, "id"> & {
  userId: User["id"];
}) {
  return prisma.debt.findFirst({
    select: { id: true, amount: true, title: true
      , debtors: true
    },
    where: { id, userId },
  });
}

export function getDebtListItems({ userId }: { userId: User["id"] }) {
  return prisma.debt.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createDebt({
  amount,
  title,
  userId,
}: Pick<Debt, "amount" | "title"> & {
  userId: User["id"];
}) {
  return prisma.debt.create({
    data: {
      title,
      amount,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function addDebtor({
  id,
  userId,
  newDebtor
}: Pick<Debt, "id"> & { userId: User["id"] } & { newDebtor: string } ) {
  // const debt = getDebt({id, userId})
  return prisma.debt.update({
    where: { id },
    data: {
      debtors: {
        push: newDebtor
      }
    }
  });
}

export function deleteDebt({
  id,
  userId,
}: Pick<Debt, "id"> & { userId: User["id"] }) {
  return prisma.debt.deleteMany({
    where: { id, userId },
  });
}


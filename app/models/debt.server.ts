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

export function getDebtPublic({
  id,
}: Pick<Debt, "id">) {
  return prisma.debt.findUniqueOrThrow({
    select: { id: true, amount: true, title: true
      , debtors: true
      , createdAt: true
      , user: true
    },
    where: { id },
    // include: { user: true },
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

/**
 * everytime A anonymous user confirms
 * a new entry will be added to the `debtors` list. 
 * 
 * The el element is a serialize json with this structure
 * {
 *  debtor: "xxxx"
 *  amount: "some valid number"
 * }
 * This regsitry will represent the intention
 * from the person doing this anonymously
 * 
 * - Validates that the debtor is registered in the valid debtors
 *  
 * @returns promise
 **/
export async function addDebtorConfirmation({
  id,
  unsafelyDeclaredDebtor,
  amount,
}: Pick<Debt, "id"> & { unsafelyDeclaredDebtor: string, amount: string } ) {
  
  const debt = await getDebtPublic({id})
  if(!debt || !unsafelyDeclaredDebtor || !debt?.debtors.includes(unsafelyDeclaredDebtor)) {
    throw new Error("Could not add debtor")
  }

  const text = JSON.stringify({
    debtor: unsafelyDeclaredDebtor,
    amount
  })
  return prisma.debt.update({
    where: { id },
    data: {
      debtors: {
        push: text
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


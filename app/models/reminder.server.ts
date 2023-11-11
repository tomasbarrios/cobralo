import type { Debt, Reminder, User } from "@prisma/client";
import { formatDate } from "services/date/formatDate";

import { prisma } from "~/db.server";

export type { Reminder } from "@prisma/client";

export function getReminder({
  id,
  debtId,
}: Pick<Reminder, "id"> & {
  debtId: Debt["id"];
}) {
  return prisma.reminder.findFirst({
    select: { id: true, notificationDate: true
    },
    where: { id, debtId },
  });
}


export function getReminderListItems({ debtId }: { debtId: Debt["id"] }) {
  return prisma.reminder.findMany({
    where: { debtId },
    select: { id: true, notificationDate: true },
    // orderBy: { updatedAt: "desc" },
  });
}

export async function createReminder({
  notificationDate,
  body,
  debtId,
  userId
}: Pick<Reminder, "notificationDate" | "body"> & {
  debtId: Debt["id"]
} & { userId: User["id"] }) {
  
  const debt = await prisma.debt.findUnique({ where: { id: debtId }})
  const user = await prisma.user.findUnique({ where: { id: userId }})

  return prisma.reminder.create({
    data: {
      notificationDate,
      body,
      subject: formatDate(new Date(notificationDate), null),
      to: debt?.debtors[0],
      from: user?.email,
      debt: {
        connect: {
          id: debtId,
        },
      },
    },
  });
}

export function addReminder({
  debtId,
  notificationDate,
  body
}: Pick<Reminder, "body" | "notificationDate"> & { debtId: string } ) {
  
  // const debt = getReminder({id, debtId})
  // const parsedDate = notificationDate ? new Date(notificationDate) : new Date().toISOString()
  return prisma.reminder.create({
    data: {
      notificationDate,
      debt: {
        connect: {
          id: debtId,
        },
      },
    }
  });
}

export function deleteReminder({
  id,
  debtId,
}: Pick<Reminder, "id"> & { debtId: Debt["id"] }) {
  return prisma.reminder.deleteMany({
    where: { id, debtId },
  });
}


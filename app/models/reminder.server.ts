import type { Debt, Reminder } from "@prisma/client";

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

export function createReminder({
  notificationDate,
  debtId,
}: Pick<Reminder, "notificationDate"> & {
  debtId: Debt["id"];
}) {
  return prisma.reminder.create({
    data: {
      notificationDate,
      debt: {
        connect: {
          id: debtId,
        },
      },
    },
  });
}

export function addReminder({
  id,
  remindDate
}: Pick<Reminder, "id"> & { remindDate: string } ) {
  // const debt = getReminder({id, debtId})
  const notificationDate = remindDate ? new Date(remindDate) : new Date().toISOString()
  return prisma.reminder.create({
    data: {
      notificationDate,
      debt: {
        connect: {
          id: id,
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


import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllRemindersBeforeNow() {
    const currentDate = new Date()
    return prisma.reminder.findMany({
        where: {
          notificationDate: {
            lt: currentDate, // "lt" significa "menor que"
          },
          deliveryAttempts: {
            none: {}
          }
        },
        include: {
          deliveryAttempts: true
        }
      });
}

// type EmailParams = {
//   to: string,
//   from: string,
//   subject: string,
//   body: string
// }
// export async function createReminder({ to,
//   from = "tomasbarrios@protonmail.com",
// subject="from function",
// body,
// remindDate
// }: EmailParams & { remindDate: string }) {
//   const currentDate = new Date()
//   return prisma.reminder.create({
//     data: {
//       notificationDate: remindDate,
//       to: debt?.debtors[0],
//       debt: {
//         connect: {
//           id: id,
//         },
//       },
//     }
//     });
// }
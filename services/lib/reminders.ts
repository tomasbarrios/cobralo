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
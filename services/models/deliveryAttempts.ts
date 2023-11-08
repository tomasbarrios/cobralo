import type { DeliveryAttempt} from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllEmailsPendingToBeSent() {
  return prisma.deliveryAttempt.findMany({
    where: {
      deliveryResult: null,
    },
  });
}

export async function updateDeliveryResult({
  id,
  hasDeliverySucceeded,
  deliveryResult
}: Pick<DeliveryAttempt, "id" | "hasDeliverySucceeded" | "deliveryResult">) {
  return prisma.deliveryAttempt.update({
    where: {
      id
    },
    data: {
      deliveryResult,
      deliveredAt: new Date(),
      hasDeliverySucceeded
    }
  })
  
}

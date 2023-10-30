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
  deliveryResult
}: Pick<DeliveryAttempt, "id" | "deliveryResult">) {
  return prisma.deliveryAttempt.update({
    where: {
      id
    },
    data: {
      deliveryResult,
    }
  })
  
}

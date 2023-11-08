-- AlterTable
ALTER TABLE "DeliveryAttempt" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "hasDeliverySucceeded" BOOLEAN;

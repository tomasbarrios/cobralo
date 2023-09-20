-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "notificationDate" TIMESTAMP(3) NOT NULL,
    "debtId" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import { PrismaClient } from "@prisma/client";
import { getAllRemindersBeforeNow } from "./models/reminders";
require("dotenv").config();

//import express, { Request, Response } from 'express';

/**
 * Prisma deps
 */
// import { EmailScheduler } from "./src/EmailScheduler";

/**
 * init
 */
const prisma = new PrismaClient();

// const resend = new Resend(process.env.RESEND_API_KEY);
//const app = express();

/**
 * Will find any `Reminder` that should be delivered
 * For each, will create a `Delivery Attempt`
 */
async function main() {
  if (!process.env.DATABASE_URL) {
    throw `Abort: You need to define RESEND_API_KEY in the .env file.`;
  } else {
    //   const emailJob = new EmailScheduler();
    // Reminders where notificationDate is NOW, or BEFORE NOW.
    const reminders = await getAllRemindersBeforeNow();
    const results = [];
    for (const r of reminders) {
      const res = await prisma.deliveryAttempt.create({
        data: {
          from: r.from || "Acme <onboarding@resend.dev>",
          to: r.to || "tomasbarrios@protonmail.com",
          subject: r.subject || "Hello World",
          body: r.body || "<strong>it works! Still needs a template, define one in ....</strong>",
          reminderId: r.id,
        },
      });
      results.push(res);
    }
    console.log("done", { reminders });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

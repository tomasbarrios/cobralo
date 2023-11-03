// import { EmailScheduler } from "./scheduler/EmailScheduler";
import { EmailSender } from "./email/EmailSender";
import { getAllEmailsPendingToBeSent, updateDeliveryResult } from "./models/deliveryAttempts";
// import { EmailScheduler } from "./scheduler/EmailScheduler";
require("dotenv").config();

/**
 * Resend deps
 */
// import { Resend } from "resend";
//import express, { Request, Response } from 'express';

/**
 * Prisma deps
 */
// import { PrismaClient } from "@prisma/client";

// import { EmailScheduler } from "./src/EmailScheduler";

/**
 * init
 */
// const prisma = new PrismaClient();

// const resend = new Resend(process.env.RESEND_API_KEY);
//const app = express();

async function main() {
    if (!process.env.RESEND_API_KEY) {
      throw `Abort: You need to define RESEND_API_KEY in the .env file.`;
    } else {
      
      const deliveryAttempts = await getAllEmailsPendingToBeSent();

      const onSuccessFn = (id: string) => async ({success, error}: {success: boolean, error: Error | undefined}) => {
        console.log("onSuccess!", {
          success,
          error
        })
        if(error) {
          await updateDeliveryResult({id, deliveryResult: error.message})
        } else {
          await updateDeliveryResult({id, deliveryResult: "SUCCESS"})
        }
      }
      for(const da of deliveryAttempts) {
        const { id, from, to, subject, body } = da
        const emailJob = await EmailSender({ 
          from, to, subject, body, 
          // metadata: {id}
        })
        onSuccessFn(id)(emailJob)
      }
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


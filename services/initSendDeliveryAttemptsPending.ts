import { EmailSender } from "./email/EmailSender";
import type { EmailSenderResult } from "./email/EmailSender";
import {
  getAllEmailsPendingToBeSent,
  updateDeliveryResult,
} from "./models/deliveryAttempts";
import { render } from "./email/TemplateRenderer"
import { formatDate } from "./date/formatDate";
import { formatNumber } from "./number/formatMoney";

require("dotenv").config();

async function main() {
  if (!process.env.RESEND_API_KEY) {
    throw `Abort: You need to define RESEND_API_KEY in the .env file.`;
  } else {
    const deliveryAttempts = await getAllEmailsPendingToBeSent();

    const onSuccessFn =
      (id: string) =>
      async ({
        success,
        error,
        result
      }: EmailSenderResult) => {
        console.log("onSuccess!", {
          success,
          error,
          result
        });
        if (success && error === undefined) {
          // Delivery OK; Happy path :)
          await updateDeliveryResult({ id, hasDeliverySucceeded: true, deliveryResult: JSON.stringify(result) });
        } else if (success && error !== undefined) {
          // API responded OK, but could NOT DELIVER ; Happy path :S
          await updateDeliveryResult({ id, hasDeliverySucceeded: false, deliveryResult: JSON.stringify(result) });
        } else {
          // Unexpected error!
          console.error("UNEXPECTED ERROR", error)
          await updateDeliveryResult({ id, hasDeliverySucceeded: false, deliveryResult: JSON.stringify(error) });
        }
      };

    // const templateData = {
    //   "receiverName": "Pablo Spencer",
      
    //   // Debt
    //   "invoiceNumber": "#6",
    //   "invoiceDescription": "Mantencion 2020",
    //   "invoiceLink": "https://drive.google.com/file/d/15t4HSWdEVU6zxhp5FCZF-GxHgpamMejH/view?usp=drive_link",
    //   "invoiceDate": formatDate(new Date("2023-11-8 12:00")),
    //   "invoiceAmount": formatNumber(780_845),
      
    //   // Payment
    //   "paymentAccountDetails": "Datos de transferencia\n----------------------\nDigital Craft SpA, RUT 76.560.456-7\nCuenta Corriente 3477095052, Banco Estado\n",
      
    //   // Sender
    //   "senderName": "Tomas Barrios",
    //   "senderSignature": "Digital Craft SpA",
    // }

    // console.log({etaTemplate})
    
    for (const da of deliveryAttempts) {
      const { id, from, to, subject, body } = da;
      const resultHandler = onSuccessFn(id)
      const etaTemplate = render({ template: "paymentDue", data: body})
      const emailSendResult = await EmailSender(
        {
          from,
          to,
          subject,
          body: body,
        },
        {}
        // { text: etaTemplate, html: null },
        );
      resultHandler(emailSendResult);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

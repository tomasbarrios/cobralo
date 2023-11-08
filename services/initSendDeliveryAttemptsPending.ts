import { EmailSender } from "./email/EmailSender";
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
      }: {
        success: boolean;
        error: Error | undefined;
      }) => {
        console.log("onSuccess!", {
          success,
          error,
        });
        if (error) {
          await updateDeliveryResult({ id, deliveryResult: error.message });
        } else {
          await updateDeliveryResult({ id, deliveryResult: "SUCCESS" });
        }
      };

    

    // const templateRequiredKeys = [
    //   // Receiver
    //   "receiverName",
      
    //   // Debt
    //   "invoiceNumber",
    //   "invoiceDescription",
    //   "invoiceDate",
    //   "invoiceAmount",
      
    //   // Payment
    //   "paymentDetails",
      
    //   // Sender
    //   "senderName",
    //   "senderSignature"
    // ]

    const templateData = {
      "receiverName": "Pablo Spencer",
      
      // Debt
      "invoiceNumber": "#6",
      "invoiceDescription": "Mantencion 2020",
      "invoiceLink": "https://drive.google.com/file/d/15t4HSWdEVU6zxhp5FCZF-GxHgpamMejH/view?usp=drive_link",
      "invoiceDate": formatDate(new Date("2023-11-8 12:00")),
      "invoiceAmount": formatNumber(780_845),
      
      // Payment
      "paymentAccountDetails": "Datos de transferencia\n----------------------\nDigital Craft SpA, RUT 76.560.456-7\nCuenta Corriente 3477095052, Banco Estado\n",
      
      // Sender
      "senderName": "Tomas Barrios",
      "senderSignature": "Digital Craft SpA",
    }

    // let htmlTemplate = "JUST A STRING TO TEST";
    const etaTemplate = render({ template: "paymentDue", data: templateData})
    console.log({etaTemplate})

    // const result = await fs.readFile("./templates/receipt.html", function (err: Error, html: string) {
    //   if (err) {
    //     throw err;
    //   }
    // console.log("DASDA", {html})

    //   htmlTemplate = html;
    //   return html
    // });

    // console.log("DASDA", {htmlTemplate, result})

    for (const da of deliveryAttempts) {
      const { id, from, to, subject, body } = da;
      const emailJob = await EmailSender(
        {
          from,
          to,
          subject,
          body,
        },
        { html: etaTemplate },
      );
      onSuccessFn(id)(emailJob);
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

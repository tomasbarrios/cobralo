import type { IScheduler} from "./scheduler";
import { Scheduler } from "./scheduler";
import { Resend } from "resend";
require("dotenv").config();


const resend = new Resend(process.env.RESEND_API_KEY);
console.log("init email");

type Email = {
  from: string;
  to: string;
  subject: string;
  body: string;
};

// type ResendResponse = {
//   name: string,
//   message: string,
//   statusCode: number
// }

export class EmailScheduler extends Scheduler {
  from: string;
  to: string;
  subject: string;
  body: string;

  constructor({ from, to, subject, body, onSuccess, metadata }: Email & { onSuccess: Function, metadata: {} }) {
    console.log("EmailScheduler > init email");
    console.dir({ from, to, subject, body, metadata });
    // super("*/1 * * * * *"); // 1 sec
    super("*/1 * * * *", onSuccess); // 1 min

    this.from = from;
    this.to = to;
    this.subject = subject;
    this.body = body;
  }

  private sendEmail(): Promise<IScheduler> {
    return new Promise(async (resolve, reject) => {
      let params = {
        from: "Acme <onboarding@resend.dev>",
        to: ["tomasbarrios@protonmail.com"],
        subject: "Hello World",
        html: "<strong>it works!</strong>",
      };

      if (process.env.NODE_ENV === "production") {
        params = {
          from: this.from,
          to: [this.to],
          subject: this.subject,
          html: this.body,
        };
      }

      try {
        const data = await resend.emails.send(params);
        // console.log("EmailScheduler:", {data})

        // const res = JSON.stringify(data)
        let emailStatus: IScheduler = {
          success: false,
          error: new Error(`Blank state. Response: ${JSON.stringify(data)}`),
        }
        // const emailStatus: IScheduler = {
          if(data && Object.keys(data).includes("statusCode")) {
            // console.log({name: data["name"]})
            // console.log({name: data["statusCode"]})
            emailStatus = {
              success: true,
              error: new Error(JSON.stringify(data)),
            };
          } else {
            emailStatus = {
              success: true,
              error: new Error(),
            };
          }
        resolve(emailStatus);
      } catch (error: unknown) {
        const emailStatus: IScheduler = {
          success: false,
          error: new Error("error"),
        };
        reject(emailStatus);
      }
    });
  }

  executeJob(): Promise<IScheduler> {
    return new Promise(async (resolve, reject) => {
      const data = await this.sendEmail();
      console.log("EmailScheduler Result", { result: data });
      resolve(data);
    });
  }
}

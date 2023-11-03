import type { IScheduler } from "../scheduler/scheduler";
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
export const EmailSender = function ({ to, from, subject, body }: Email) {
  console.log("EMAIL SENDER params", { to, from, subject, body })
  const sendEmail = async function() {
    let params = {
      from: "Acme <onboarding@resend.dev>",
      to: ["tomasbarrios@protonmail.com"],
      subject: "Hello World",
      html: "<strong>it works!</strong>",
    };

    if (process.env.NODE_ENV === "production") {
      params = {
        from: from,
        to: [to],
        subject: subject,
        html: body,
      };
    }

    // type ErrorR = CreateEmailResponse | {
    //   message: string,
    //   statusCode: string,
    //   name: string
    // }
    try {
      console.log("Attempting delivery", { params })
      const data = await resend.emails.send(params);

      let emailStatus: IScheduler = {
        success: false,
        error: new Error(`Blank state. Response: ${JSON.stringify(data)}`),
      };
      
      if (data && Object.keys(data).includes("statusCode")) {
        // console.log(typeof data)
        emailStatus = {
          success: true,
          error: new Error(JSON.stringify(data)),
        };
        Object.keys(data).forEach((i, v) => {
          /**
           * https://stackoverflow.com/questions/18083389/ignore-typescript-errors-property-does-not-exist-on-value-of-type
           * https://github.com/search?q=repo%3Aresendlabs%2Fresend-node%20CreateEmailResponse&type=issues
           * 
           * We use `(data as any)`, typescript cries otherwise.
           */
          console.dir({i, d: (data as any)["statusCode"]})
          // const ds = data["statusCode"];
          if( i === "statusCode" && (data as any)["statusCode"] === 429) {
            console.log("MADE IT", "we are caching errors", (data as any)["message"] )
            console.warn("THIS SHOULD NEVER HAPPEN!!!!!")
            console.warn("THIS SHOULD NEVER HAPPEN!!!!!")
            console.warn("THIS SHOULD NEVER HAPPEN!!!!!")
            console.warn("THIS SHOULD NEVER HAPPEN!!!!!")
            // if()
            // throw Error(i+"_"+v)
            // emailStatus = {
            //   success: true,
            //   error: new Error(JSON.stringify((data as any)["message"])),
            // };
          }
        })
        
      } else {
        emailStatus = {
          success: true,
          error: undefined,
        };
      }
      return emailStatus;
    } catch (error: unknown) {
      const emailStatus: IScheduler = {
        success: false,
        error: new Error("error"),
      };
      return emailStatus;
    }
  }

  return sendEmail()
};



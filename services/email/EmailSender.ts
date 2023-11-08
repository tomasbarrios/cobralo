import { Resend } from "resend";
import type { CreateEmailResponse } from "resend/build/src/emails/interfaces";
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);
console.log("init email");

type Email = {
  from: string;
  to: string;
  subject: string;
  body: string;
};

type Metadata = {
  html?: string;
};

/**
 * EmailSenderResult can have different forms
 *
 * if delivery succeeded => (a)
 * if delivery had problems => (b)
 *
 * a) { id: string }
 * b) { statusCode: string, message: string, name: string }
 *
 * Known cases for (b)
 * -----------------
 * { statusCode: 429, "message":"You have reached your daily email sending quota.", name: "daily_quota_exceeded" };
 * { statusCode: 403, "message":"You can only send testing emails to your own email address (tomasbarrios@protonmail.com).","name":"validation_error"}
 */
export type EmailSenderResult =
  | {
      success: true;
      error: undefined;
      result: CreateEmailResponse;
    }
  | {
      success: true;
      error: Error;
      result: { statusCode: string; message: string; name: string };
    }
  | {
      success: false;
      error: Error;
      result: string;
    };

export const EmailSender = async function (
  { to, from, subject, body }: Email,
  metadata: undefined | Metadata,
): Promise<EmailSenderResult> {
  try {
    console.log("EMAIL SENDER params", { to, from, subject, body });
    let params = metadata && metadata.html ? {
      from: "Acme <onboarding@resend.dev>",
      to: ["tomasbarrios@protonmail.com"],
      reply_to: "tomas.barrios@gmail.com",
      subject: "Hello World",
      html: "<strong>it works!</strong>",
    } : 
    {
      from: "Acme <onboarding@resend.dev>",
      to: ["tomasbarrios@protonmail.com"],
      reply_to: "tomas.barrios@gmail.com",
      subject: "Hello World",
      text: "it works in plain text",
    } 
    ;

    console.log("PROCESS", {process: process.env.NODE_ENV})
    if (process.env.NODE_ENV === "production") {
      params = metadata && metadata.html ? {
        from: `Tomas Barrios <${from}>`,
        to: [to],
        reply_to: "tomas.barrios@gmail.com",
        subject: "Factura Emitida pendiente de pago",
        html: metadata.html || body,
      } :  {
        from: `Tomas Barrios <${from}>`,
        reply_to: "tomas.barrios@gmail.com",
        to: [to],
        subject: "Factura Emitida pendiente de pago",
        text: body,
      };
    }

    console.log("EMAIL SENDER FINAL PARAMS", { params });
    const data = await resend.emails.send(params);
    let knownError = undefined;
    if (data && Object.keys(data).includes("statusCode")) {
      Object.keys(data).forEach((i, v) => {
        /**
         * https://stackoverflow.com/questions/18083389/ignore-typescript-errors-property-does-not-exist-on-value-of-type
         * https://github.com/search?q=repo%3Aresendlabs%2Fresend-node%20CreateEmailResponse&type=issues
         *
         * We use `(data as any)`, typescript cries otherwise.
         */
        console.dir({ i, d: (data as any)["statusCode"] });
        // const ds = data["statusCode"];
        if (i === "statusCode" && (data as any)["statusCode"] === 429) {
          console.log("KNOWN ERROR", { data });
        }
        console.warn("THIS SHOULD NEVER HAPPEN!!!!!");
        console.log(
          "MADE IT",
          "we are caching errors",
          (data as any)["message"],
        );
        knownError = new Error(JSON.stringify(data));
      });
    }
    return {
      success: true,
      error: knownError,
      result: data,
    };
  } catch (error: any) {
    const emailStatus: EmailSenderResult = {
      success: false,
      error: new Error("error"),
      result: error,
    };
    return emailStatus;
  }
};

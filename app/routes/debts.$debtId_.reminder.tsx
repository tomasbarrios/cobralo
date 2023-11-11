import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  useActionData,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import {
  renderTemplateForRemix as renderTemplate,
  paymentDueTemplate as defaultTemplate,
} from "templates/render";

import invariant from "tiny-invariant";

import { getDebtAndReminders } from "~/models/debt.server";
import { createReminder } from "~/models/reminder.server";
import { requireUserId } from "~/session.server";

import { formatDate } from "services/date/formatDate";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.debtId, "debtId not found");

  const debt = await getDebtAndReminders({ id: params.debtId, userId });
  if (!debt) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ debt });
};

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);

  invariant(params.debtId, "debtId not found");

  const formData = await request.formData();
  const notificationDate = formData.get("notificationDate");
  const body = formData.get("body");

  if (typeof notificationDate !== "string" || notificationDate.length === 0) {
    return json(
      {
        errors: {
          body: null,
          notificationDate: "Notification date is required",
        },
      },
      { status: 400 },
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json(
      { errors: { body: "Body is required", notificationDate: null } },
      { status: 400 },
    );
  }

  // FIXME, secure this db action by user role
  // const userId = await requireUserId(request);
  await createReminder({
    debtId: params.debtId,
    userId,
    notificationDate: new Date(notificationDate),
    body,
  });

  return redirect("/debts/" + params.debtId + "/reminder");
};

export default function DebtReminderPage() {
  console.log("DebtReminderPage loading");
  const data = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const notificationDateRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.notificationDate) {
      notificationDateRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  const urlBack = `/debts/${data.debt.id}`;

  const metadataData = data.debt.metadata
    ? Object.fromEntries(
        data.debt.metadata
          .split("\n")
          .map((line) => line.split(": "))
          .filter((pair) => pair.length === 2), // Exclude lines that don't have a key-value pair
      )
    : null;

  const etaTemplate = bodyRef.current ? bodyRef.current.value : defaultTemplate;
  const etaTemplateRendered = renderTemplate({
    templateString: etaTemplate,
    data: metadataData,
  });

  return (
    <div style={{ position: "relative" }}>
      <h1 className="text-3xl font-bold">
        Add a <i>reminder</i>
      </h1>{" "}
      to
      <h3 className="text-2xl font-bold">{data.debt.title}</h3>
      <a
        style={{ position: "absolute", top: "0", right: "0" }}
        href={urlBack}
        className=""
      >
        Done, go back to Debt
      </a>
      <p className="py-6">{data.debt.amount}</p>
      <h3 className="text-xl font-bold">List of reminders</h3>
      <ul className="py-6">
        {data.debt.reminders.length > 0 &&
          data.debt.reminders.map((d, i) => (
            <li key={`reminder-${i}-${d.notificationDate}`}>
              {formatDate(new Date(d.notificationDate))}
            </li>
          ))}
      </ul>
      <hr className="my-4" />
      <Form method="post">
        <div>
          <div>
            <pre>{etaTemplateRendered}</pre>
          </div>

          <div>
            <label className="flex w-full flex-col gap-1">
              <span>Body: </span>
              <textarea
                ref={bodyRef}
                defaultValue={etaTemplate}
                name="body"
                rows={8}
                className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
                aria-invalid={actionData?.errors?.body ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.body ? "body-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.body ? (
              <div className="pt-1 text-red-700" id="body-error">
                {actionData.errors.body}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Fecha de envío: </span>
            <input
              ref={notificationDateRef}
              name="notificationDate"
              defaultValue={formatDate(new Date())}
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={
                actionData?.errors?.notificationDate ? true : undefined
              }
              aria-errormessage={
                actionData?.errors?.notificationDate
                  ? "notificationDate-error"
                  : undefined
              }
            />
          </label>
          {actionData?.errors?.notificationDate ? (
            <div className="pt-1 text-red-700" id="notificationDate-error">
              {actionData.errors.notificationDate}
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Programar recordatorio
        </button>
      </Form>
      <a href="/reminder/new">NOW</a>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Debt not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}

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
import invariant from "tiny-invariant";

import { addReminder, getDebtAndReminders } from "~/models/debt.server";
import { requireUserId } from "~/session.server";

import { showDate } from "~/utils/date";

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
  
  invariant(params.debtId, "debtId not found");

  const formData = await request.formData();
  const remindDate = formData.get("remindDate");

  if (typeof remindDate !== "string" || remindDate.length === 0) {
    return json(
      { errors: { amount: null, title: "Reminder is required" } },
      { status: 400 },
    );
  }

  // FIXME, secure this db action by user role
  // const userId = await requireUserId(request);
  await addReminder({ id: params.debtId, remindDate });

  return redirect("/debts/" + params.debtId + "/reminder");
};

export default function DebtDetailsPage() {
  console.log("debts.debtId loading");
  const data = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const remindDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      remindDateRef.current?.focus();
    }
  }, [actionData]);

  const urlBack = `/debts/${data.debt.id}`;

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
        {data.debt.reminders.length > 0
         && 
         data.debt.reminders.map(d => 
         (<li key={`reminder-${d.notificationDate}`}>
           {showDate(new Date(d.notificationDate))}
         </li>))
        }
      </ul>
      <hr className="my-4" />
      <Form method="post">
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Reminder (date when you want it...): </span>
            <input
              ref={remindDateRef}
              name="remindDate"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.title ? "title-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.title ? (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.title}
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Add
        </button>
        next monday
        in a week
        in two weeks
        every month first monday
    
      </Form>

      <a href="/reminder/new">
        NOW
      </a>

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

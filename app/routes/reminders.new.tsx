import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createReminder } from "~/models/reminder.server";
import { getDebt } from "~/models/debt.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const notificationDate = formData.get("notificationDate");

  if (typeof notificationDate !== "string" || notificationDate.length === 0) {
    return json(
      { errors: { notificationDate: "Date is required" } },
      { status: 400 },
    );
  }

  console.log({URL: request.url})
//   return null
  const debt = await getDebt({id: "clmo5in440006w82ie92k3tnu", userId})
  if (!debt) throw new Response("Chilltime", { status: 420 });
  const reminder = await createReminder({ 
    notificationDate: new Date(notificationDate), 
    debtId: debt.id });

  return redirect(`/reminders/${reminder.id}`);
};

export default function NewReminderPage() {
  const actionData = useActionData<typeof action>();
  const notificationDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.notificationDate) {
      notificationDateRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <h1 className="text-3xl font-bold mb-4">New Reminder</h1>
        
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Date: </span>
          <input
            ref={notificationDateRef}
            name="notificationDate"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.notificationDate ? true : undefined}
            aria-errormessage={
              actionData?.errors?.notificationDate ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.notificationDate ? (
          <div className="pt-1 text-red-700" id="notificationDate-error">
            {actionData.errors.notificationDate}
          </div>
        ) : null}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}

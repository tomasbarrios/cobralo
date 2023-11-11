import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createDebt } from "~/models/debt.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const amount = formData.get("amount");
  const metadata = formData.get("metadata");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { amount: null, title: "Title is required", metadata: null } },
      { status: 400 },
    );
  }

  if (typeof amount !== "string" || amount.length === 0) {
    return json(
      { errors: { amount: "Amount is required", title: null, metadata: null } },
      { status: 400 },
    );
  }

  const debt = await createDebt({ amount, title, userId, metadata });

  return redirect(`/debts/${debt.id}`);
};

export default function NewDebtPage() {
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const metadataRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.amount) {
      amountRef.current?.focus();
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
        <h1 className="text-3xl font-bold mb-4">New Debt</h1>
        
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            defaultValue={(new Date()).toUTCString()}
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

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Amount: </span>
          <input
            ref={amountRef}
            name="amount"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.amount ? true : undefined}
            aria-errormessage={
              actionData?.errors?.amount ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.amount ? (
          <div className="pt-1 text-red-700" id="amount-error">
            {actionData.errors.amount}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Metadata: </span>
          <textarea
            ref={metadataRef}
            name="metadata"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            aria-invalid={actionData?.errors?.metadata ? true : undefined}
            aria-errormessage={
              actionData?.errors?.metadata ? "metadata-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.metadata ? (
          <div className="pt-1 text-red-700" id="metadata-error">
            {actionData.errors.metadata}
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

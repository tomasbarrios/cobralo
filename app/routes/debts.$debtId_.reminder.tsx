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

import { addDebtor, getDebt } from "~/models/debt.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.debtId, "debtId not found");

  const debt = await getDebt({ id: params.debtId, userId });
  if (!debt) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ debt });
};

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.debtId, "debtId not found");

  const formData = await request.formData();
  const debtor = formData.get("dueDate");

  if (typeof debtor !== "string" || debtor.length === 0) {
    return json(
      { errors: { amount: null, title: "Debtor is required" } },
      { status: 400 },
    );
  }

  await addDebtor({ id: params.debtId, userId, newDebtor: debtor });

  return redirect("/debts/" + params.debtId + "/debtor");
};

export default function DebtDetailsPage() {
  console.log("debts.debtId loading");
  const data = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const debtorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      debtorRef.current?.focus();
    }
  }, [actionData]);

  const urlBack = `/debts/${data.debt.id}`;

  return (
    <div style={{ position: "relative" }}>
      <h1 className="text-3xl font-bold">
        Add a <i>friend</i>
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
      
      <h3 className="text-xl font-bold">List of friends in debt</h3>
      <p className="py-6 c-list">
        {data.debt.debtors.length > 0 && data.debt.debtors.join(", ")}
      </p>
      <p>Anyone not in the list yet?</p>
      <hr className="my-4" />
      <Form method="post">
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Debtor (name of one of the friends who ows you): </span>
            <input
              ref={debtorRef}
              name="debtor"
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
      </Form>
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

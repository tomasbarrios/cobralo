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

import { getDebtPublic, addDebtorConfirmation } from "~/models/debt.server";
// import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  // const userId = await requireUserId(request);
  invariant(params.debtId, "debtId not found");

  const debt = await getDebtPublic({ id: params.debtId });
  if (!debt) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ debt });
};

export const action = async ({ params, request }: ActionArgs) => {
  invariant(params.debtId, "debtId not found");

  const formData = await request.formData();
  const debtor = formData.get("debtor");
  const amount = formData.get("amount");
  // console.log({debtor, amount})

  if (typeof debtor !== "string" || debtor.length === 0) {
    // console.log("DEBTOR ERROR")

    return json(
      { errors: { amount: null, debtor: "Debtor is required" } },
      { status: 400 },
    );
  }

  if (typeof amount !== "string" || amount.length === 0) {
    // console.log("AMOUNT ERROR")

    return json(
      { errors: { amount: "Amount is required", debtor: null } },
      { status: 400 },
    );
  }

  await addDebtorConfirmation({
    id: params.debtId,
    unsafelyDeclaredDebtor: debtor,
    amount: amount,
  });

  // return json({ errors: {}})
  return redirect("/p/pay/" + params.debtId + "");
};

export default function DebtDetailsPage() {
  console.log("debts.debtId loading");
  const data = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const debtorRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.debtor) {
      debtorRef.current?.focus();
    } else if (actionData?.errors?.amount) {
      amountRef.current?.focus();
    }
  }, [actionData]);

  // const urlBack = `/debts/${data.debt.id}`;

  // const amountAcceptedAsDebt = 0;

  const debtorsToChoose = data.debt.debtors;

  const handleDebtorChoosing = ({ name }: { name: string }) => {
    // console.log("CLICK!!! ", name)
    if (debtorRef.current) {
      debtorRef.current.value = name;
    }
    return "OK";
  };

  const notJSON = (str: string) => {
    try {
      const res = JSON.parse(str)
      console.log({res})
      return false
    } catch(err) {
      return true
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <h1 className="text-3xl font-bold">Lets clear our debt</h1> <p>about</p>
      <h2 className="text-2xl font-bold">{data.debt.title}</h2>
      <p className="py-2">
        {data.debt.user.email} wants to clear a debt with you
      </p>
      <div className="mt-4">
        <h3 className="py-2 text-xl font-bold">
          1. Check that the debt is correct
        </h3>
        <p className="py-2">
          <b>Total Amount</b>: {data.debt.amount} (NOT YOUR DEBT)
        </p>
        <p className="py-2">
          <b>Date</b>: {data.debt.createdAt}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="py-2 text-xl font-bold">2. Select and declare WHO YOU ARE</h3>
        <p className="py-6">
          {debtorsToChoose.filter(notJSON).map((debtorName) => {
            return (
              <button
                className="rounded px-4 py-2 border hover:bg-blue-600 focus:bg-blue-400"
                key={`button-clickon-${debtorName}`}
                onClick={() => handleDebtorChoosing({ name: debtorName })}
              >
                I am {debtorName}
              </button>
            );
          })}
        </p>
      </div>
      
      <Form method="post">
        <div>
          <input
            ref={debtorRef}
            type="hidden"
            name="debtor"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.debtor ? true : undefined}
            aria-errormessage={
              actionData?.errors?.debtor ? "debtor-error" : undefined
            }
          />
          {actionData?.errors?.debtor ? (
            <div className="pt-1 text-red-700" id="debtor-error">
              {actionData.errors.debtor}
            </div>
          ) : null}
          <label className="flex w-full flex-col gap-1">
            <span>Amount (How much do YOU OWE)</span>
            <input
              ref={amountRef}
              name="amount"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.amount ? true : undefined}
              aria-errormessage={
                actionData?.errors?.amount ? "amount-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.amount ? (
            <div className="pt-1 text-red-700" id="amount-error">
              {actionData.errors.amount}
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Accept
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

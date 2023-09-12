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

  await addDebtorConfirmation({ id: params.debtId, unsafelyDeclaredDebtor: debtor, amount: amount });

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

  const urlBack = `/debts/${data.debt.id}`;

  const amountAcceptedAsDebt = 0;

  const debtorsToChoose = data.debt.debtors

  const handleDebtorChoosing = ({name}: {name: string}) => {
    // console.log("CLICK!!! ", name)
    if (debtorRef.current) {
      debtorRef.current.value = name
    }
    return "OK"
  }

  return (
    <div style={{ position: "relative" }}>
      <h1 className="text-3xl font-bold">
        Aclaremos las cuentas mai friend
      </h1>{" "}
      to
      <h3 className="text-2xl font-bold">{data.debt.title}</h3>
      
      <p className="py-6">{data.debt.amount}</p>
      <p className="py-6">{
        debtorsToChoose.map(debtorName => {
          return (
            <button 
            className="rounded px-4 py-2 border hover:bg-blue-600 focus:bg-blue-400"
            key={`clickon${debtorName}`} onClick={() => handleDebtorChoosing({name: debtorName})}>
              I am {debtorName}</button>
          )
        })
      }</p>

      <h3 className="text-xl font-bold">List of friends in debt</h3>
      <p className="py-6 c-list">
        {data.debt.debtors.length > 0 && data.debt.debtors.join(", ")}
      </p>
      <p>Anyone not in the list yet?</p>
      <hr className="my-4" />
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
            <span>Amount (Total owed)</span>
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
          Add
        </button>
      </Form>
      <a
        href={urlBack}
        className=""
      >
        Done, I accept my debt of $ {amountAcceptedAsDebt}
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

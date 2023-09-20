import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  // Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { getDebt } from "~/models/debt.server";
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
  // const userId = await requireUserId(request);
  invariant(params.debtId, "debtId not found");

  // await deleteDebt({ id: params.debtId, userId });

  return redirect("/debts");
};

export default function DebtDetailsPage() {
  console.log("debts.debtId loading")
  const data = useLoaderData<typeof loader>();

  const urlAddDebtor = `/debts/${data.debt.id}/debtor`
  const urlAddReminder = `/debts/${data.debt.id}/reminder`
  
  return (
    <div>
      <h3 className="text-2xl font-bold">{data.debt.title}</h3>
      <p className="py-6">Amount: {data.debt.amount}</p>
      
      <p className="py-6">
        Debtors: {
          data.debt.debtors ? 
            data.debt.debtors.join(", ") 
            : 
            "No yet"
        } 
        {" "}
        <a
          href={urlAddDebtor}
        >
          (click to add)
        </a>
      </p>

      <p className="py-6">
        Reminders: 
            "No yet"
        {" "}
        <a
          href={urlAddReminder}
        >
          (click to add)
        </a>
      </p>

      <hr className="my-4" />
      {/* <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form> */}
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

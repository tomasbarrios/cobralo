import { Link } from "@remix-run/react";

export default function DebtIndexPage() {
  return (
    <div>

    <p className="mb-6">
      No debt selected. Select a debt on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new debt.
      </Link>
    </p>
    <hr />
    <p className="mt-6">You can use a debt entry same as a expense</p>
    </div>
  );
}

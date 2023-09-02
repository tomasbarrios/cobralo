import { Link } from "@remix-run/react";

export default function DebtIndexPage() {
  return (
    <p>
      No debt selected. Select a debt on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new debt.
      </Link>
    </p>
  );
}

import Link from "next/link";

const REPORTS = [
  {
    title: "Messages",
    description:
      "Review message activity, delivery status, encoding, destinations, and submission dates.",
    href: "/reports/messages",
  },
  {
    title: "Route Performance",
    description:
      "Review routing attempts and performance across routes and connectors.",
    href: "/reports/routes",
  },
  {
    title: "Float Ledger",
    description:
      "Review float transactions, credits, references, and ledger activity.",
    href: "/reports/float",
  },
] as const;

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Reports
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Review platform activity and download detailed reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {REPORTS.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="rounded-lg border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {report.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {report.description}
            </p>

            <div className="mt-4 text-sm font-medium text-gray-900">
              View report →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
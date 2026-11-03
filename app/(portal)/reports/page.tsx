import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

import { requireAuth } from "@/lib/auth/require-auth";
import {
  hasPermission,
  isPlatformUser,
} from "@/lib/authorization/authorization";
import { BUILDER } from "@/features/report-builder/types";

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
  {
    title: "Transactions",
    description:
      "Review payment transactions, providers, services, currencies, statuses, and references.",
    href: "/reports/transactions",
  },
] as const;

export default async function ReportsPage() {
  const user = await requireAuth();
  const reports = [
    ...REPORTS,
    ...(hasPermission(user, BUILDER.read)
      ? [
          {
            title: "Report Builder",
            description:
              "Build reusable Excel reports from connected databases.",
            href: "/reports/builder",
          },
        ]
      : []),
    ...(isPlatformUser(user) && hasPermission(user, BUILDER.connections)
      ? [
          {
            title: "Database Connections",
            description: "Manage read-only database connections for reporting.",
            href: "/reports/connections",
          },
        ]
      : []),
  ];
  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Review platform activity and download detailed reports."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {report.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {report.description}
            </p>

            <div className="mt-4 text-sm font-medium text-slate-900">
              View report →
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

import { TransactionReport } from "@/features/reports/components/transaction-report";

interface ClientTransactionsReportPageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export default async function ClientTransactionsReportPage({
  params,
}: ClientTransactionsReportPageProps) {
  const { id } =
    await params;

  return (
    <TransactionReport
      clientId={id}
    />
  );
}
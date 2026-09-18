import { FloatLedgerReport } from "@/features/reports/components/float-ledger-report";

type FloatLedgerReportPageProps = {
  readonly params: Promise<{
    id: string;
  }>;
};

export default async function FloatLedgerReportPage({
  params,
}: FloatLedgerReportPageProps) {
  const { id } = await params;

  return <FloatLedgerReport clientId={id} />;
}
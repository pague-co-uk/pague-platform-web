import { MessageReport } from "@/features/reports/components/message-report";

type MessageReportPageProps = {
  readonly params: Promise<{
    id: string;
  }>;
};

export default async function MessageReportPage({
  params,
}: MessageReportPageProps) {
  const { id } = await params;

  return <MessageReport clientId={id} />;
}
import { builderAccess } from "@/features/report-builder/access";
import { ReportEditor } from "@/features/report-builder/components/report-editor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <ReportEditor id={(await params).id} capabilities={await builderAccess()} />
  );
}

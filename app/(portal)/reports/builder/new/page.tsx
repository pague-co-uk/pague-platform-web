import { notFound } from "next/navigation";
import { builderAccess } from "@/features/report-builder/access";
import { ReportEditor } from "@/features/report-builder/components/report-editor";
export default async function Page() {
  const capabilities = await builderAccess();
  if (!capabilities.edit) notFound();
  return <ReportEditor capabilities={capabilities} />;
}

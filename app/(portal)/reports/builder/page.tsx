import { builderAccess } from "@/features/report-builder/access";
import { ReportList } from "@/features/report-builder/components/report-list";
export default async function Page() {
  return <ReportList capabilities={await builderAccess()} />;
}

import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/authorization/require-authorization";
import { isPlatformUser } from "@/lib/authorization/authorization";
import { BUILDER } from "@/features/report-builder/types";
import { Connections } from "@/features/report-builder/components/connections";
export default async function Page() {
  const user = await requirePermission(BUILDER.connections);
  if (!isPlatformUser(user)) notFound();
  return <Connections />;
}

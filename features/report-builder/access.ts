import "server-only";
import { requirePermission } from "@/lib/authorization/require-authorization";
import {
  hasPermission,
  isPlatformUser,
} from "@/lib/authorization/authorization";
import { BUILDER } from "./types";

export async function builderAccess() {
  const user = await requirePermission(BUILDER.read);
  return {
    edit: hasPermission(user, BUILDER.edit),
    export: hasPermission(user, BUILDER.export),
    connections:
      isPlatformUser(user) && hasPermission(user, BUILDER.connections),
  };
}

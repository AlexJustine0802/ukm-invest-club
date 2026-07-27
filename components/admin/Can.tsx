import { can } from "@/lib/adminAccess";
import type { Action } from "@/lib/permissions";

/**
 * Renders its children only when the current actor holds the permission.
 *
 * Wraps the "+ New" links, row Edit links and delete buttons so a view-only
 * role sees a page with no controls on it instead of buttons that fail.
 *
 * This is presentation only. The action behind every one of those controls
 * guards itself with requirePermission  hiding a button is a courtesy, not a
 * security boundary.
 */
export default async function Can({
  module,
  action,
  children,
}: {
  module: string;
  action: Action;
  children: React.ReactNode;
}) {
  return (await can(module, action)) ? <>{children}</> : null;
}

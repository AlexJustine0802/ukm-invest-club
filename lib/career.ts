// Helpers shared by the member career page and the notification bell.

/** How long a posting stays in the notification bell. */
export const NEW_ALERT_DAYS = 14;

/**
 * How long it wears the "New" / "Newly posted" badge.
 *
 * Shorter than the bell window on purpose: the badge is a "look at this now"
 * marker and stops meaning anything if half the list carries it, while the bell
 * is a backlog the member may not have opened for a week.
 */
export const NEW_BADGE_DAYS = 3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whether the "New" badge still shows. */
export function isNewAlert(createdAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - createdAt.getTime() < NEW_BADGE_DAYS * MS_PER_DAY;
}

/** Whether the posting is still listed in the bell. */
export function isInBell(createdAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - createdAt.getTime() < NEW_ALERT_DAYS * MS_PER_DAY;
}

/** "Posted today" / "Posted 3 days ago"  the bell's age line. */
export function postedLabel(createdAt: Date, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - createdAt.getTime()) / MS_PER_DAY);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}

/** "Closes in 5 days" / "Closes today" / "Closed 2 days ago" */
export function deadlineLabel(deadline: Date, now: Date = new Date()): string {
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(deadline) - startOf(now)) / MS_PER_DAY);
  if (days < 0)
    return `Closed ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

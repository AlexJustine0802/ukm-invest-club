export const ASSIGNMENT_STATUSES = ["ACTIVE", "SUBMITTED", "COMPLETED"] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

/** An ACTIVE assignment counts as "due soon" inside this many days. */
export const DUE_SOON_DAYS = 3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole days until `due`, counted from the start of today so an assignment due
 * later today reads "Due today" rather than flipping on the hour.
 */
export function daysUntil(due: Date, now: Date = new Date()): number {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfDue = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
  ).getTime();
  return Math.round((startOfDue - startOfToday) / MS_PER_DAY);
}

export function dueLabel(due: Date, now: Date = new Date()): string {
  const days = daysUntil(due, now);
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function isDueSoon(
  due: Date,
  status: string,
  now: Date = new Date(),
): boolean {
  if (status !== "ACTIVE") return false;
  const days = daysUntil(due, now);
  return days <= DUE_SOON_DAYS;
}

export const ASSIGNMENT_TABS = [
  { id: "all", label: "All Assignments" },
  { id: "active", label: "Active" },
  { id: "due-soon", label: "Due Soon" },
  { id: "submitted", label: "Submitted" },
  { id: "completed", label: "Completed" },
] as const;

export type AssignmentTab = (typeof ASSIGNMENT_TABS)[number]["id"];

export function isValidTab(value: string | undefined): value is AssignmentTab {
  return ASSIGNMENT_TABS.some((t) => t.id === value);
}

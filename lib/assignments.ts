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

/** What one member sees an assignment as. */
export type MemberState = "UPCOMING" | "ACTIVE" | "OVERDUE" | "COMPLETED";

/**
 * NotificationRead key for an assignment.
 *
 * The bell row and the tab badge share it on purpose: reading the notification
 * and opening the tab are both "I have seen this assignment", so either one
 * clears both counts.
 */
export function assignmentKey(id: string): string {
  return `assignment-${id}`;
}

/**
 * The state to show one member.
 *
 * Handing work in completes it  marking is feedback that arrives afterwards
 * (a bell notification), not another step in the list, so a graded and an
 * ungraded submission both read COMPLETED.
 *
 * `Assignment.status` is deliberately ignored: it is one column shared by
 * everyone, so it cannot describe what any individual did. Everything the
 * member sees  stat cards, tab counts, badges, "due soon"  goes through here,
 * or the numbers disagree with the list.
 */
export function memberState(
  opensAt: Date | null,
  submission?: { gradedAt: Date | null } | null,
  now: Date = new Date(),
  /** Omit only where the caller genuinely has no deadline to hand. */
  dueDate?: Date | null,
): MemberState {
  if (submission) return "COMPLETED";
  if (!isOpen(opensAt, now)) return "UPCOMING";
  // Past the deadline with nothing handed in is its own state. Leaving it
  // ACTIVE is what made an overdue assignment keep counting as active work and
  // still show up under "Due soon".
  if (dueDate && isPastDue(dueDate, now)) return "OVERDUE";
  return "ACTIVE";
}

/**
 * Past the deadline. Compared to the minute, not the day: the deadline the
 * member is shown includes a time, so that is the one that has to bite.
 */
export function isPastDue(due: Date, now: Date = new Date()): boolean {
  return due.getTime() < now.getTime();
}

/**
 * Whether an assignment accepts work yet. `opensAt` null = open immediately.
 *
 * The single source of truth for the gate: the form hides the upload, the list
 * badges it, and the submit action refuses  all three ask here.
 */
export function isOpen(opensAt: Date | null, now: Date = new Date()): boolean {
  return !opensAt || opensAt <= now;
}

/** Only an open, unsubmitted assignment can be "due soon". */
export function isDueSoon(
  due: Date,
  state: string,
  now: Date = new Date(),
): boolean {
  if (state !== "ACTIVE") return false;
  const days = daysUntil(due, now);
  // days >= 0: an overdue deadline is not "soon", it is gone.
  return days >= 0 && days <= DUE_SOON_DAYS && !isPastDue(due, now);
}

export const ASSIGNMENT_TABS = [
  { id: "all", label: "All Assignments" },
  { id: "active", label: "Active" },
  { id: "due-soon", label: "Due Soon" },
  { id: "coming-soon", label: "Coming Soon" },
  { id: "completed", label: "Completed" },
] as const;

export type AssignmentTab = (typeof ASSIGNMENT_TABS)[number]["id"];

export function isValidTab(value: string | undefined): value is AssignmentTab {
  return ASSIGNMENT_TABS.some((t) => t.id === value);
}

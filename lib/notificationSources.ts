/**
 * The automatic bell notifications and their switches.
 *
 * One list drives the admin form, the action that saves it and the guards in
 * lib/notifications, so a new source is added in one place. Each `id` is a
 * SiteSettings column name  renaming one means a database change.
 *
 * Announcements are deliberately absent: an admin writes those by hand, so
 * there is nothing to switch off.
 */
export const NOTIFICATION_SOURCES = [
  {
    id: "notifyAssignments",
    label: "Assignments",
    description:
      "A new assignment appears, and the member's own work being marked.",
  },
  {
    id: "notifyMaterials",
    label: "Resource materials",
    description: "A file or link added to a resource folder.",
  },
  {
    id: "notifyEvents",
    label: "Events",
    description: "A published event that has not happened yet.",
  },
  {
    id: "notifyDiscussions",
    label: "Discussions",
    description: "New posts in the discussion channels.",
  },
  {
    id: "notifyRecruitment",
    label: "Recruitment",
    description: "While the club's recruitment form is open.",
  },
  {
    id: "notifyCareer",
    label: "Career alerts",
    description: "Job postings added in the last few days.",
  },
] as const;

export type NotificationSourceId = (typeof NOTIFICATION_SOURCES)[number]["id"];

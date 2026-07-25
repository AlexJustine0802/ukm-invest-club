import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Seeds the member dashboard with the content the design mockup showed, so the
// admin has real rows to edit instead of a blank slate. Safe to re-run: it only
// inserts when the table is empty.
const items = [
  // Overview stats
  { section: "overview", title: "Resources Viewed", subtitle: "12", note: "↑ 3 this week", icon: "BookOpen", color: "bg-blue-50 text-primary", order: 0 },
  { section: "overview", title: "Upcoming Events", subtitle: "4", note: "↑ 1 this week", icon: "CalendarCheck", color: "bg-emerald-50 text-emerald-600", order: 1 },
  { section: "overview", title: "Pending Assignments", subtitle: "2", note: "Due Soon", icon: "ClipboardList", color: "bg-violet-50 text-violet-600", order: 2 },
  { section: "overview", title: "Career Alerts", subtitle: "5", note: "New opportunities", icon: "Briefcase", color: "bg-amber-50 text-amber-600", order: 3 },

  // Announcements
  { section: "announcement", title: "ICU Stock Pitch Competition 2025", subtitle: "Registrations are now open!", meta: "Deadline: 30 July 2025", badge: "Competitions", note: "2h ago", icon: "Trophy", color: "bg-blue-50 text-primary", order: 0 },
  { section: "announcement", title: "New Material Added", subtitle: "Valuation: DCF Method", meta: "Check it out in Resources", badge: "Materials", note: "1d ago", icon: "FileText", color: "bg-emerald-50 text-emerald-600", order: 1 },
  { section: "announcement", title: "Member Gathering", subtitle: "Let's connect and grow together!", meta: "20 July 2025", badge: "Members", note: "2d ago", icon: "Users", color: "bg-violet-50 text-violet-600", order: 2 },
  { section: "announcement", title: "Equity Research Workshop", subtitle: "Hands-on session on building research reports.", meta: "18 July 2025, 19:00 WIB", badge: "Events", note: "3d ago", icon: "CalendarDays", color: "bg-amber-50 text-amber-600", order: 3 },

  // Recent resources
  { section: "resource", title: "Financial Statement Analysis", subtitle: "Lesson 7: Cash Flow Statement", badge: "Analysis", note: "Yesterday", color: "bg-slate-800", order: 0 },
  { section: "resource", title: "Valuation Methods (DCF)", subtitle: "Lesson 3: Calculating WACC", badge: "Valuation", note: "2 days ago", color: "bg-blue-500", order: 1 },
  { section: "resource", title: "Portfolio Management", subtitle: "Lesson 2: Modern Portfolio Theory", badge: "Portfolio", note: "3 days ago", color: "bg-yellow-500", order: 2 },
  { section: "resource", title: "Macroeconomics for Investors", subtitle: "Lesson 1: Inflation & Interest Rates", badge: "Economy", note: "5 days ago", color: "bg-teal-500", order: 3 },

  // Discussions
  { section: "discussion", title: "What's your take on the recent BI rate decision?", meta: "General Discussion · 23 replies", note: "1h ago", color: "bg-blue-50 text-primary", order: 0 },
  { section: "discussion", title: "Thoughts on BBCA Q2 2025 earnings?", meta: "Investing Talk · 18 replies", note: "5h ago", color: "bg-emerald-50 text-emerald-600", order: 1 },
  { section: "discussion", title: "Best resources to learn DCF?", meta: "Questions & Help · 14 replies", note: "1d ago", color: "bg-amber-50 text-amber-600", order: 2 },

  // Assignment deadlines
  { section: "deadline", title: "Company Analysis Report", subtitle: "Due in 3 days", meta: "18 July 2025, 23:59", icon: "ClipboardList", color: "bg-red-50 text-red-600", order: 0 },
  { section: "deadline", title: "Stock Pitch Deck", subtitle: "Due in 7 days", meta: "22 July 2025, 23:59", icon: "ClipboardList", color: "bg-amber-50 text-amber-600", order: 1 },
  { section: "deadline", title: "Macroeconomics Essay", subtitle: "Due in 10 days", meta: "25 July 2025, 23:59", icon: "ClipboardList", color: "bg-amber-50 text-amber-600", order: 2 },

  // Career alerts
  { section: "career", title: "J.P. Morgan", subtitle: "Investment Banking Intern", meta: "Jakarta • Internship", badge: "New", color: "bg-slate-800", order: 0 },
  { section: "career", title: "Maybank", subtitle: "Wealth Management Intern", meta: "Jakarta • Internship", badge: "New", color: "bg-yellow-500", order: 1 },
  { section: "career", title: "Deloitte", subtitle: "Risk Advisory Analyst", meta: "Jakarta • Full-time", badge: "New", color: "bg-emerald-500", order: 2 },

  // Resource folders
  { section: "folder", title: "Investment Basics", meta: "24 materials", badge: "Investment", icon: "BarChart3", color: "bg-blue-500", order: 0 },
  { section: "folder", title: "Financial Analysis", meta: "36 materials", badge: "Research", icon: "PieChart", color: "bg-emerald-500", order: 1 },
  { section: "folder", title: "Valuation", meta: "28 materials", badge: "Research", icon: "Search", color: "bg-violet-500", order: 2 },
  { section: "folder", title: "Portfolio Management", meta: "22 materials", badge: "Investment", icon: "Briefcase", color: "bg-orange-500", order: 3 },
  { section: "folder", title: "Equity Research", meta: "42 materials", badge: "Research", icon: "Landmark", color: "bg-yellow-500", order: 4 },
  { section: "folder", title: "Workshop Recordings", meta: "19 materials", badge: "Videos", icon: "Video", color: "bg-teal-500", order: 5 },
  { section: "folder", title: "Financial Model Templates", meta: "15 materials", badge: "Templates", icon: "FileSpreadsheet", color: "bg-sky-600", order: 6 },
  { section: "folder", title: "Recommended Books", meta: "31 materials", badge: "Books & Reading", icon: "BookMarked", color: "bg-rose-500", order: 7 },
  { section: "folder", title: "Tools & Useful Links", meta: "12 materials", badge: "Tools & Links", icon: "Wrench", color: "bg-indigo-500", order: 8 },
];

async function main() {
  const existing = await prisma.dashboardItem.count();
  if (existing > 0) {
    console.log(`dashboard_item already has ${existing} rows — skipping seed`);
  } else {
    await prisma.dashboardItem.createMany({ data: items });
    console.log(`seeded ${items.length} dashboard items`);
  }
  await prisma.$disconnect();
}
main();

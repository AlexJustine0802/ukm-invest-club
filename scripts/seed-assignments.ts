import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Dates are relative to today so "Due in N days" and the Due Soon tab stay
// meaningful — the mockup's fixed May-2025 dates would all read as overdue.
function inDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return d;
}

const items = [
  { title: "Company Analysis Report", category: "Financial Analysis", workType: "Individual",
    description: "Analyze the financial performance of the assigned company using ratios and trends.",
    dueDate: inDays(2), status: "ACTIVE", icon: "FileText", color: "bg-red-50 text-red-600", order: 0 },
  { title: "Valuation Exercise: DCF Model", category: "Valuation", workType: "Group (3–4 members)",
    description: "Build a DCF model for the assigned company and write a short valuation summary.",
    dueDate: inDays(5), status: "ACTIVE", icon: "PieChart", color: "bg-amber-50 text-amber-600", order: 1 },
  { title: "Investment Presentation", category: "Portfolio Management", workType: "Group (3–4 members)",
    description: "Create a 10-min investment presentation for your chosen stock.",
    dueDate: inDays(7), status: "ACTIVE", icon: "BarChart3", color: "bg-blue-50 text-primary", order: 2 },
  { title: "Market Update Summary", category: "Macroeconomics", workType: "Individual",
    description: "Summarize the latest market news and its potential impact.",
    dueDate: inDays(10), status: "ACTIVE", icon: "FileSpreadsheet", color: "bg-emerald-50 text-emerald-600", order: 3 },
  { title: "Sector Deep Dive: Banking", category: "Equity Research", workType: "Individual",
    description: "Submitted write-up on the Indonesian banking sector.",
    dueDate: inDays(-4), status: "SUBMITTED", icon: "Landmark", color: "bg-violet-50 text-violet-600", order: 4 },
  { title: "Weekly Market Recap", category: "Macroeconomics", workType: "Individual",
    description: "Short recap of last week's market movements.",
    dueDate: inDays(-7), status: "SUBMITTED", icon: "TrendingUp", color: "bg-violet-50 text-violet-600", order: 5 },
  { title: "Intro to Financial Statements Quiz", category: "Investment Basics", workType: "Individual",
    description: "Graded quiz covering the three core financial statements.",
    dueDate: inDays(-20), status: "COMPLETED", icon: "CheckCircle2", color: "bg-emerald-50 text-emerald-600", order: 6 },
  { title: "Portfolio Construction Exercise", category: "Portfolio Management", workType: "Group (3–4 members)",
    description: "Build a sample portfolio and justify the allocation.",
    dueDate: inDays(-30), status: "COMPLETED", icon: "Briefcase", color: "bg-emerald-50 text-emerald-600", order: 7 },
];

async function main() {
  const existing = await prisma.assignment.count();
  if (existing > 0) {
    console.log(`assignment table already has ${existing} rows — skipping seed`);
  } else {
    await prisma.assignment.createMany({ data: items });
    console.log(`seeded ${items.length} assignments`);
  }
  await prisma.$disconnect();
}
main();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function at(y: number, m: number, d: number, h: number, min: number) {
  return new Date(y, m - 1, d, h, min, 0, 0);
}

const cats = [
  { slug: "workshop", title: "Workshop", color: "blue", icon: "Building2", order: 0 },
  { slug: "competition", title: "Competition", color: "green", icon: "Building2", order: 1 },
  { slug: "seminar", title: "Seminar", color: "violet", icon: "Building2", order: 2 },
  { slug: "company-visit", title: "Company Visit", color: "amber", icon: "Building2", order: 3 },
];

const events = [
  { slug: "equity-research-workshop", title: "Equity Research Workshop", cat: "workshop",
    description: "Enhance your equity research skills with hands-on training and real case studies.",
    start: at(2025, 7, 18, 13, 0), end: at(2025, 7, 18, 16, 0),
    location: "Online (Zoom)", capacity: 60, taken: 28, seatUnit: "seats" },
  { slug: "stock-pitch-competition-2025", title: "Stock Pitch Competition 2025", cat: "competition",
    description: "Present your best investment ideas and compete for amazing prizes!",
    start: at(2025, 8, 2, 9, 0), end: at(2025, 8, 2, 17, 0),
    location: "Unpar Campus", capacity: 30, taken: 15, seatUnit: "teams" },
  { slug: "guest-lecture-capital-market-outlook-2025", title: "Guest Lecture: Capital Market Outlook 2025", cat: "seminar",
    description: "Insights from industry experts on market trends and investment opportunities.",
    start: at(2025, 8, 22, 15, 30), end: at(2025, 8, 22, 17, 30),
    location: "Hybrid (Room 301 & Zoom)", capacity: 100, taken: 42, seatUnit: "seats" },
  { slug: "company-visit-mandiri-sekuritas", title: "Company Visit: Mandiri Sekuritas", cat: "company-visit",
    description: "Get real exposure to the work environment and industry professionals.",
    start: at(2025, 9, 5, 10, 0), end: at(2025, 9, 5, 14, 0),
    location: "Mandiri Sekuritas, Jakarta", capacity: 25, taken: 5, seatUnit: "seats" },
];

async function main() {
  const ids: Record<string, string> = {};
  for (const c of cats) {
    const row = await prisma.eventCategory.upsert({
      where: { slug: c.slug },
      update: { color: c.color },
      create: c,
    });
    ids[c.slug] = row.id;
  }

  let created = 0;
  for (const e of events) {
    const existing = await prisma.event.findUnique({ where: { slug: e.slug } });
    if (existing) continue;
    await prisma.event.create({
      data: {
        slug: e.slug, title: e.title, description: e.description,
        eventDate: e.start, endDate: e.end, location: e.location,
        capacity: e.capacity, seatUnit: e.seatUnit,
        categoryId: ids[e.cat], published: true,
      },
    });
    created++;
  }
  console.log(`categories ready; created ${created} event(s)`);
  await prisma.$disconnect();
}
main();

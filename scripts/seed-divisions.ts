import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const divisions = [
  { slug: "pvpc", name: "PVPC", tagline: "President, Vice President, Controller", icon: "Trophy",
    description: "Leads ICU as a whole — setting direction, overseeing every division, and making sure the club runs according to its vision and standards." },
  { slug: "finance-legality", name: "Finance & Legality", tagline: "Legal, Finance", icon: "Landmark",
    description: "Manages the club's finances and keeps its activities, agreements, and administration legally sound." },
  { slug: "human-resource-development", name: "Human Resource Development", tagline: "People Growth & Experience, Talent Attraction & Acquisition", icon: "Users",
    description: "Grows our people — recruitment, onboarding, internal development, and the member experience across the year." },
  { slug: "business-development", name: "Business Development", tagline: "Creative Entrepreneur, Market Research & Strategy", icon: "TrendingUp",
    description: "Builds ICU's business side through entrepreneurial projects, market research, and long-term growth strategy." },
  { slug: "external-relationship", name: "External Relationship", tagline: "Media Relations, Collaboration & Network", icon: "Handshake",
    description: "Connects ICU with the outside world — media, sponsors, partner communities, and institutional collaborations." },
  { slug: "creative-brand-marketing", name: "Creative Brand Marketing", tagline: "Design Marketing, Content & Publication Strategy", icon: "Camera",
    description: "Shapes how ICU looks and sounds — design, content, and publication strategy across all our channels." },
  { slug: "project-event", name: "Project & Event", tagline: null, icon: "CalendarDays",
    description: "Plans and runs ICU's projects and events end to end, from concept through to execution on the day." },
  { slug: "research-development", name: "Research & Development", tagline: "Investment Analyst, Website Development", icon: "BarChart3",
    description: "Produces ICU's investment research and builds the tools and platforms the club runs on, including this website." },
];

async function main() {
  const existing = await prisma.division.count();
  if (existing > 0) {
    console.log(`division table already has ${existing} rows — skipping seed`);
  } else {
    for (const [i, d] of divisions.entries()) {
      await prisma.division.create({ data: { ...d, order: i } });
    }
    console.log(`seeded ${divisions.length} divisions`);
  }
  await prisma.$disconnect();
}
main();

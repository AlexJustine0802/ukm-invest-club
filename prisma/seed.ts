import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding database...");

  // --- Events ---
  await prisma.event.deleteMany();
  await prisma.event.createMany({
    data: [
      {
        title: "Stock Market Bootcamp 2026",
        slug: "stock-market-bootcamp-2026",
        description:
          "A 3-day intensive bootcamp covering fundamental and technical analysis, portfolio construction, and risk management. Open to all Universitas Parahyangan students.\n\nDay 1 focuses on reading financial statements, Day 2 on charting and technical indicators, and Day 3 on building your first diversified portfolio using a paper-trading simulator.",
        eventDate: daysFromNow(21),
        location: "Auditorium, Universitas Parahyangan",
        coverImage:
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
        published: true,
      },
      {
        title: "Weekly Market Recap & Discussion",
        slug: "weekly-market-recap-discussion",
        description:
          "Join our members every Friday to discuss the past week's market movements, notable earnings, and macroeconomic news. Bring your questions and trade ideas!",
        eventDate: daysFromNow(5),
        location: "Room 3201, Building 9",
        coverImage:
          "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
        published: true,
      },
      {
        title: "Guest Talk: Investing in Indonesian Blue Chips",
        slug: "guest-talk-indonesian-blue-chips",
        description:
          "A seasoned fund manager shares insights on evaluating Indonesian blue-chip companies and building long-term wealth through the IDX.",
        eventDate: daysFromNow(-14),
        location: "Online (Zoom)",
        coverImage:
          "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=1200&q=80",
        published: true,
      },
    ],
  });

  // --- Publications ---
  await prisma.publication.deleteMany();
  await prisma.publication.createMany({
    data: [
      {
        title: "Understanding Compound Interest: The Eighth Wonder",
        slug: "understanding-compound-interest",
        excerpt:
          "Why starting early matters more than starting big — a beginner-friendly look at how compounding builds wealth over time.",
        content:
          "## The Power of Compounding\n\nCompound interest is often called the eighth wonder of the world. Unlike simple interest, compounding means you earn returns not only on your principal but also on the returns you've already accumulated.\n\n### A Simple Example\n\nInvesting **Rp 1,000,000** at 10% annually:\n\n- Year 1: Rp 1,100,000\n- Year 5: Rp 1,610,510\n- Year 20: Rp 6,727,500\n\nThe longer your money stays invested, the more dramatic the effect. This is why time in the market beats timing the market.\n\n### Key Takeaways\n\n1. Start as early as you can.\n2. Reinvest your dividends and returns.\n3. Stay consistent — small, regular contributions add up.",
        author: "ICUnpar Research Team",
        coverImage:
          "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&w=1200&q=80",
        published: true,
        publishedAt: daysFromNow(-3),
      },
      {
        title: "How to Read a Company's Balance Sheet",
        slug: "how-to-read-a-balance-sheet",
        excerpt:
          "A practical guide to the three sections every investor should understand before buying a stock.",
        content:
          "## Balance Sheet Basics\n\nA balance sheet is a snapshot of what a company owns and owes at a point in time. It follows one simple equation:\n\n> **Assets = Liabilities + Equity**\n\n### Assets\n\nWhat the company owns — cash, inventory, property, and receivables.\n\n### Liabilities\n\nWhat the company owes — loans, accounts payable, and bonds.\n\n### Equity\n\nThe residual value belonging to shareholders. A healthy, growing equity base is often a good sign.\n\nUnderstanding these three sections helps you judge whether a company is financially sound before you invest.",
        author: "ICUnpar Research Team",
        coverImage:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
        published: true,
        publishedAt: daysFromNow(-10),
      },
      {
        title: "Diversification: Don't Put All Your Eggs in One Basket",
        slug: "diversification-explained",
        excerpt:
          "How spreading your investments across assets can reduce risk without necessarily sacrificing returns.",
        content:
          "## Why Diversify?\n\nDiversification means spreading your investments so that no single loss can sink your portfolio. When one asset underperforms, others may offset it.\n\n### Ways to Diversify\n\n- Across **sectors** (banking, consumer goods, technology)\n- Across **asset classes** (stocks, bonds, gold)\n- Across **geographies** (domestic and international markets)\n\nDiversification won't eliminate risk entirely, but it smooths the ride and protects you from catastrophic single-stock losses.",
        author: "ICUnpar Research Team",
        coverImage:
          "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=1200&q=80",
        published: true,
        publishedAt: daysFromNow(-20),
      },
    ],
  });

  // --- Team members ---
  await prisma.teamMember.deleteMany();
  await prisma.teamMember.createMany({
    data: [
      {
        name: "Andi Wijaya",
        role: "President",
        bio: "Final-year Management student passionate about value investing and financial literacy.",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        order: 1,
      },
      {
        name: "Bella Kurnia",
        role: "Vice President",
        bio: "Leads member development and coordinates our weekly research sessions.",
        photo:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        order: 2,
      },
      {
        name: "Chandra Halim",
        role: "Head of Research",
        bio: "Focuses on equity research and macroeconomic analysis of the Indonesian market.",
        photo:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        order: 3,
      },
      {
        name: "Dina Pratiwi",
        role: "Head of Events",
        bio: "Organizes bootcamps, guest talks, and community activities.",
        photo:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
        order: 4,
      },
    ],
  });

  // --- Gallery ---
  await prisma.galleryImage.deleteMany();
  await prisma.galleryImage.createMany({
    data: [
      {
        title: "Bootcamp Session",
        imageUrl:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80",
        caption: "Members collaborating during our annual bootcamp.",
        order: 1,
      },
      {
        title: "Guest Speaker",
        imageUrl:
          "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
        caption: "An industry expert sharing market insights.",
        order: 2,
      },
      {
        title: "Team Discussion",
        imageUrl:
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
        caption: "Weekly research and discussion session.",
        order: 3,
      },
      {
        title: "Networking Event",
        imageUrl:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
        caption: "Connecting with fellow student investors.",
        order: 4,
      },
      {
        title: "Award Ceremony",
        imageUrl:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80",
        caption: "Celebrating our members' achievements.",
        order: 5,
      },
      {
        title: "Study Group",
        imageUrl:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80",
        caption: "Preparing for the trading simulation contest.",
        order: 6,
      },
    ],
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

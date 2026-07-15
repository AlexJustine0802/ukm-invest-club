import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding database...");

  // --- Event categories ---
  await prisma.event.updateMany({ data: { categoryId: null } });
  await prisma.eventCategory.deleteMany();

  const eventCategoryDefs = [
    {
      title: "Seminar",
      slug: "seminar",
      description: "Sesi berbagi ilmu dan wawasan mendalam",
      icon: "Building2",
      order: 1,
    },
    {
      title: "Workshop",
      slug: "workshop",
      description: "Pelatihan praktis untuk mengasah keterampilan",
      icon: "Wrench",
      order: 2,
    },
    {
      title: "Talkshow",
      slug: "talkshow",
      description: "Diskusi inspiratif bersama para profesional",
      icon: "MessageCircle",
      order: 3,
    },
    {
      title: "Training",
      slug: "training",
      description: "Program pelatihan terstruktur",
      icon: "Presentation",
      order: 4,
    },
    {
      title: "Competition",
      slug: "competition",
      description: "Kompetisi investasi dan analisis",
      icon: "Trophy",
      order: 5,
    },
    {
      title: "Networking",
      slug: "networking",
      description: "Bangun koneksi dan perluas relasi",
      icon: "Share2",
      order: 6,
    },
  ];

  const eventCategories: Record<string, string> = {};
  for (const c of eventCategoryDefs) {
    const created = await prisma.eventCategory.create({ data: c });
    eventCategories[c.slug] = created.id;
  }

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
        categoryId: eventCategories["training"],
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
        categoryId: eventCategories["talkshow"],
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
        categoryId: eventCategories["talkshow"],
      },
      {
        title: "Investment Outlook 2026: Navigating the Uncertainty",
        slug: "investment-outlook-2026",
        description:
          "Analisis kondisi pasar global dan strategi investasi di tengah ketidakpastian ekonomi bersama para praktisi pasar modal.",
        eventDate: daysFromNow(14),
        location: "Auditorium FEB Unpar",
        coverImage: "/images/research-seminar.png",
        published: true,
        categoryId: eventCategories["seminar"],
      },
      {
        title: "Financial Modeling for Investment Analysis",
        slug: "financial-modeling-for-investment-analysis",
        description:
          "Belajar membangun model keuangan untuk analisis dan valuasi perusahaan secara hands-on.",
        eventDate: daysFromNow(28),
        location: "Lab. Capital Market",
        coverImage: "/images/research-modeling.png",
        published: true,
        categoryId: eventCategories["workshop"],
      },
      {
        title: "ICU Investment Challenge 2026",
        slug: "icu-investment-challenge-2026",
        description:
          "Kompetisi analisis investasi untuk mengasah kemampuan riset dan presentasi mahasiswa.",
        eventDate: daysFromNow(45),
        location: "Auditorium FEB Unpar",
        coverImage:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
        published: true,
        categoryId: eventCategories["competition"],
      },
      {
        title: "Economic Outlook 2026",
        slug: "economic-outlook-2026",
        description: "Market outlook seminar with guest speakers.",
        eventDate: daysFromNow(-30),
        location: "Auditorium FEB Unpar",
        coverImage:
          "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
        published: true,
        categoryId: eventCategories["seminar"],
      },
      {
        title: "Technical Analysis Workshop",
        slug: "technical-analysis-workshop",
        description: "Hands-on session for reading charts and indicators.",
        eventDate: daysFromNow(-45),
        location: "Lab. Capital Market",
        coverImage:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
        published: true,
        categoryId: eventCategories["workshop"],
      },
      {
        title: "ICU Bonding & Networking Night",
        slug: "icu-bonding-networking-night",
        description:
          "Malam santai untuk mempererat hubungan antar anggota sekaligus membangun relasi baru.",
        eventDate: daysFromNow(-60),
        location: "Ballroom Hotel",
        coverImage:
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
        published: true,
        categoryId: eventCategories["networking"],
      },
    ],
  });

  // --- Research categories ---
  await prisma.publication.updateMany({ data: { categoryId: null } });
  await prisma.researchCategory.deleteMany();

  const categoryDefs = [
    {
      title: "Equity Research",
      slug: "equity-research",
      description: "Analisis saham & sektor",
      icon: "PieChart",
      order: 1,
    },
    {
      title: "Macroeconomics",
      slug: "macroeconomics",
      description: "Analisis ekonomi makro",
      icon: "BarChart3",
      order: 2,
    },
    {
      title: "Fixed Income",
      slug: "fixed-income",
      description: "Analisis obligasi & suku bunga",
      icon: "CircleDollarSign",
      order: 3,
    },
    {
      title: "Industry Analysis",
      slug: "industry-analysis",
      description: "Analisis industri & bisnis",
      icon: "TrendingUp",
      order: 4,
    },
    {
      title: "Global Market",
      slug: "global-market",
      description: "Analisis pasar global",
      icon: "Globe2",
      order: 5,
    },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryDefs) {
    const created = await prisma.researchCategory.create({ data: c });
    categories[c.slug] = created.id;
  }

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
        categoryId: categories["equity-research"],
        featured: false,
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
        categoryId: categories["equity-research"],
        featured: false,
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
        categoryId: categories["industry-analysis"],
        featured: false,
      },
      {
        title: "Indonesia Economic Outlook 2024",
        slug: "indonesia-economic-outlook-2024",
        excerpt:
          "Peluang dan tantangan sektor perbankan di tengah kondisi ekonomi global.",
        content:
          "## Ringkasan\n\nEkonomi Indonesia diperkirakan tumbuh moderat pada 2024, ditopang konsumsi domestik yang tetap kuat meski suku bunga masih tinggi.\n\n### Sorotan Sektor Perbankan\n\n- Pertumbuhan kredit stabil di kisaran 9-11%.\n- NIM (Net Interest Margin) sedikit tertekan akibat biaya dana yang naik.\n- Kualitas aset tetap terjaga dengan rasio NPL yang rendah.\n\n### Kesimpulan\n\nSektor perbankan tetap menjadi salah satu sektor paling defensif untuk dicermati investor sepanjang 2024.",
        author: "ICUnpar Research Team",
        coverImage: "/images/research-building.png",
        published: true,
        publishedAt: daysFromNow(-1),
        categoryId: categories["macroeconomics"],
        featured: true,
        featuredOrder: 1,
        pageCount: 24,
        badge: "Latest Research",
      },
      {
        title: "Policy Rate Monitor: BI Rate Decision Recap",
        slug: "policy-rate-monitor",
        excerpt:
          "Ringkasan keputusan BI dan implikasi ke pasar modal untuk kuartal ini.",
        content:
          "## Keputusan BI Rate\n\nBank Indonesia mempertahankan suku bunga acuan pada level saat ini, sejalan dengan ekspektasi pasar.\n\n### Implikasi ke Pasar\n\nPasar obligasi dan saham merespons secara terbatas, dengan fokus investor bergeser ke data inflasi berikutnya.",
        author: "ICUnpar Research Team",
        coverImage:
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
        published: true,
        publishedAt: daysFromNow(-6),
        categoryId: categories["macroeconomics"],
        featured: true,
        featuredOrder: 2,
        pageCount: 12,
      },
      {
        title: "Indonesia Bond Market Update",
        slug: "indonesia-bond-market-update",
        excerpt:
          "Yield curve, SUN benchmark, dan sentimen obligasi terkini.",
        content:
          "## Yield Curve\n\nYield SUN benchmark tenor 10 tahun bergerak relatif stabil, mencerminkan ekspektasi pasar terhadap arah suku bunga global.\n\n### Sentimen\n\nAliran dana asing ke pasar obligasi domestik tetap positif secara year-to-date.",
        author: "ICUnpar Research Team",
        coverImage:
          "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
        published: true,
        publishedAt: daysFromNow(-8),
        categoryId: categories["fixed-income"],
        featured: true,
        featuredOrder: 3,
        pageCount: 18,
      },
      {
        title: "Duration & Convexity: A Practical Guide",
        slug: "duration-and-convexity-guide",
        excerpt:
          "Panduan praktis membaca risiko harga obligasi bagi investor pemula.",
        content:
          "## Apa itu Duration?\n\nDuration mengukur sensitivitas harga obligasi terhadap perubahan suku bunga. Semakin tinggi duration, semakin besar risiko perubahan harga.\n\n### Convexity\n\nConvexity melengkapi duration dengan menangkap sifat non-linear dari hubungan harga dan yield.",
        author: "ICUnpar Research Team",
        coverImage:
          "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=1200&q=80",
        published: true,
        publishedAt: daysFromNow(-15),
        categoryId: categories["fixed-income"],
        featured: false,
      },
      {
        title: "Consumer Sector Update: Margins Under Pressure",
        slug: "consumer-sector-update",
        excerpt:
          "Tren margin, daya beli, dan strategi emiten konsumer menghadapi 2024.",
        content:
          "## Tekanan Margin\n\nKenaikan biaya bahan baku dan distribusi menekan margin emiten konsumer, meski volume penjualan tetap bertumbuh.\n\n### Strategi Emiten\n\nBeberapa emiten mulai melakukan reformulasi produk dan efisiensi rantai pasok untuk menjaga profitabilitas.",
        author: "ICUnpar Research Team",
        coverImage: "/images/research-modeling.png",
        published: true,
        publishedAt: daysFromNow(-4),
        categoryId: categories["industry-analysis"],
        featured: true,
        featuredOrder: 4,
        pageCount: 16,
      },
      {
        title: "Digital Economy Radar",
        slug: "digital-economy-radar",
        excerpt:
          "Peta peluang bisnis teknologi dan platform digital di Indonesia.",
        content:
          "## Peta Peluang\n\nSektor e-commerce dan fintech tetap menjadi motor pertumbuhan ekonomi digital Indonesia, dengan adopsi pembayaran digital yang terus meningkat.",
        author: "ICUnpar Research Team",
        coverImage:
          "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
        published: true,
        publishedAt: daysFromNow(-18),
        categoryId: categories["industry-analysis"],
        featured: false,
      },
      {
        title: "Global Market Weekly",
        slug: "global-market-weekly",
        excerpt:
          "Update indeks global, komoditas, dan aliran dana asing minggu ini.",
        content:
          "## Ringkasan Global\n\nIndeks saham global bergerak variatif, dengan sentimen pasar dipengaruhi oleh data inflasi Amerika Serikat dan pergerakan harga komoditas.",
        author: "ICUnpar Research Team",
        coverImage: "/images/research-seminar.png",
        published: true,
        publishedAt: daysFromNow(-2),
        categoryId: categories["global-market"],
        featured: false,
      },
      {
        title: "FX & Commodities Brief",
        slug: "fx-and-commodities-brief",
        excerpt:
          "Ringkasan pergerakan USD, minyak, emas, dan dampaknya ke Indonesia.",
        content:
          "## Nilai Tukar\n\nRupiah bergerak dalam rentang terbatas terhadap dolar AS, dipengaruhi oleh ekspektasi kebijakan The Fed.\n\n### Komoditas\n\nHarga minyak dan emas tetap menjadi faktor kunci bagi neraca perdagangan Indonesia.",
        author: "ICUnpar Research Team",
        coverImage:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
        published: true,
        publishedAt: daysFromNow(-12),
        categoryId: categories["global-market"],
        featured: false,
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

  // --- Site settings (singleton) ---
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      homeAboutImage: "/images/research-building.png",
      aboutHeroImage: "/images/hero-community.svg",
    },
  });

  // --- Hero slides (home carousel) ---
  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.createMany({
    data: [
      {
        location: "home",
        imageUrl: "/images/hero-growth.svg",
        eyebrow: "Learn. Analyze. Grow Together.",
        titleStart: "Empowering Future ",
        highlight: "Investors",
        titleEnd: "",
        description:
          "We are a campus community that shares knowledge, analyzes markets, and grows together in the world of investment.",
        order: 1,
      },
      {
        location: "home",
        imageUrl: "/images/hero-research.svg",
        eyebrow: "Research. Discuss. Decide.",
        titleStart: "Insight Today, Better ",
        highlight: "Decisions",
        titleEnd: " Tomorrow",
        description:
          "Providing in-depth research and market insight to help students understand finance with sharper perspective.",
        order: 2,
      },
      {
        location: "home",
        imageUrl: "/images/hero-community.svg",
        eyebrow: "Community. Collaboration. Growth.",
        titleStart: "Learn. Share. ",
        highlight: "Grow",
        titleEnd: " Together.",
        description:
          "Join a community of passionate students who believe in continuous learning and long-term growth.",
        order: 3,
      },
      // Home "About Us" section slideshow (images only)
      {
        location: "home-about",
        imageUrl: "/images/research-building.png",
        order: 1,
      },
      {
        location: "home-about",
        imageUrl: "/images/research-seminar.png",
        order: 2,
      },
      {
        location: "home-about",
        imageUrl: "/images/research-modeling.png",
        order: 3,
      },
      // About-page slideshow ("Our Community" cards)
      {
        location: "about",
        imageUrl: "/images/research-modeling.png",
        title: "Workshop",
        subtitle: "Financial Modeling & Valuation",
        caption: "April 2025",
        icon: "CalendarDays",
        order: 1,
      },
      {
        location: "about",
        imageUrl: "/images/research-seminar.png",
        title: "Guest Speaker Session",
        subtitle: "Market Outlook 2025",
        caption: "March 2025",
        icon: "Users",
        order: 2,
      },
      {
        location: "about",
        imageUrl: "/images/research-building.png",
        title: "Company Visit",
        subtitle: "IDX Building",
        caption: "February 2025",
        icon: "Landmark",
        order: 3,
      },
      {
        location: "about",
        imageUrl: "/images/hero-community.svg",
        title: "Research & Discussion",
        subtitle: "Weekly Research Meeting",
        caption: "Every Week",
        icon: "Users",
        order: 4,
      },
    ],
  });

  // --- Impact stats (shared home + about) ---
  await prisma.impactStat.deleteMany();
  await prisma.impactStat.createMany({
    data: [
      // Home + About ("Our Impact")
      { section: "home", label: "Active Members", value: "350+", icon: "Users", order: 1 },
      { section: "home", label: "Research Published", value: "120+", icon: "FileText", order: 2 },
      { section: "home", label: "Events Held", value: "40+", icon: "CalendarDays", order: 3 },
      { section: "home", label: "Partners", value: "15+", icon: "Building2", order: 4 },
      // Research page ("Research By The Numbers")
      { section: "research", label: "Research Published", value: "50+", icon: "Users", order: 1 },
      { section: "research", label: "Active Analysts", value: "15+", icon: "Users", order: 2 },
      { section: "research", label: "Data Points Analyzed", value: "10K+", icon: "Waypoints", order: 3 },
      { section: "research", label: "Companies Covered", value: "120+", icon: "Landmark", order: 4 },
      { section: "research", label: "Years of Research", value: "5+", icon: "PieChart", order: 5 },
    ],
  });

  // --- Partners (shared home + about) ---
  await prisma.partner.deleteMany();
  await prisma.partner.createMany({
    data: [
      { name: "Mandiri Sekuritas", order: 1 },
      { name: "BNI Sekuritas", order: 2 },
      { name: "CGS CIMB", order: 3 },
      { name: "Trimegah", order: 4 },
      { name: "Mirae Asset", order: 5 },
      { name: "ajaib", order: 6 },
      { name: "IDX", order: 7 },
    ],
  });

  // --- Community moments ---
  await prisma.momentPhoto.deleteMany();
  await prisma.moment.deleteMany();

  const moments: {
    title: string;
    category: string;
    date: Date;
    coverImage: string;
    order: number;
    photos: string[];
  }[] = [
    {
      title: "Financial Modeling & Valuation Workshop",
      category: "Workshop",
      date: new Date("2025-04-12"),
      coverImage: "/images/research-modeling.png",
      order: 1,
      photos: [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Company Visit to IDX Building",
      category: "Company Visit",
      date: new Date("2025-02-21"),
      coverImage: "/images/research-building.png",
      order: 2,
      photos: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Market Outlook 2025",
      category: "Seminar",
      date: new Date("2025-03-15"),
      coverImage: "/images/research-seminar.png",
      order: 3,
      photos: [
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Weekly Research Meeting",
      category: "Research",
      date: daysFromNow(-2),
      coverImage: "/images/hero-community.svg",
      order: 4,
      photos: [
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "ICU Recruitment 2025",
      category: "Internal Gathering",
      date: new Date("2025-01-18"),
      coverImage:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
      order: 5,
      photos: [
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Investment Challenge 2025",
      category: "Competition",
      date: new Date("2025-05-24"),
      coverImage:
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80",
      order: 6,
      photos: [
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "ICU Bonding Night",
      category: "Bonding",
      date: new Date("2025-04-05"),
      coverImage:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
      order: 7,
      photos: [
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Valuation Bootcamp",
      category: "Workshop",
      date: new Date("2025-03-02"),
      coverImage: "/images/research-modeling.png",
      order: 8,
      photos: [
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Guest Speaker: Portfolio Management",
      category: "Seminar",
      date: new Date("2025-02-08"),
      coverImage: "/images/research-seminar.png",
      order: 9,
      photos: [
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
      ],
    },
  ];

  for (const m of moments) {
    await prisma.moment.create({
      data: {
        title: m.title,
        category: m.category,
        date: m.date,
        coverImage: m.coverImage,
        order: m.order,
        photos: {
          create: m.photos.map((imageUrl, i) => ({ imageUrl, order: i })),
        },
      },
    });
  }

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

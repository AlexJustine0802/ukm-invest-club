// Impact/stat cards are part of the page layout, not optional decoration. With
// no ImpactStat rows configured the grid still renders four cards reading 0, so
// the band keeps its height instead of collapsing.

export interface StatView {
  id: string;
  label: string;
  value: string;
  icon: string;
}

export type StatSection = "home" | "research";

const DEFAULTS: Record<StatSection, { label: string; icon: string }[]> = {
  home: [
    { label: "Active Members", icon: "Users" },
    { label: "Events Held", icon: "CalendarDays" },
    { label: "Research Published", icon: "FileText" },
    { label: "Partners", icon: "Handshake" },
  ],
  research: [
    { label: "Publications", icon: "FileText" },
    { label: "Research Categories", icon: "BookOpen" },
    { label: "Analysts", icon: "Users" },
    { label: "Reports This Year", icon: "BarChart3" },
  ],
};

/** The configured stats, or four zeroed placeholders when none exist yet. */
export function withDefaultStats(
  rows: StatView[],
  section: StatSection,
): StatView[] {
  if (rows.length > 0) return rows;
  return DEFAULTS[section].map((d, index) => ({
    id: `default-${section}-${index}`,
    value: "0",
    ...d,
  }));
}

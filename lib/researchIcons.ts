import {
  PieChart,
  BarChart3,
  CircleDollarSign,
  TrendingUp,
  Globe2,
  FileText,
  LineChart,
  Landmark,
  type LucideIcon,
} from "lucide-react";

export const RESEARCH_ICONS: Record<string, LucideIcon> = {
  PieChart,
  BarChart3,
  CircleDollarSign,
  TrendingUp,
  Globe2,
  FileText,
  LineChart,
  Landmark,
};

export const RESEARCH_ICON_KEYS = Object.keys(RESEARCH_ICONS);

export function getResearchIcon(key: string): LucideIcon {
  return RESEARCH_ICONS[key] ?? FileText;
}

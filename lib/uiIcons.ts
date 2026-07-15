import {
  Users,
  FileText,
  CalendarDays,
  Building2,
  Handshake,
  Landmark,
  Camera,
  Trophy,
  Globe2,
  BarChart3,
  TrendingUp,
  Waypoints,
  PieChart,
  type LucideIcon,
} from "lucide-react";

// Shared icon map for editable UI sections (impact stats, about slides).
export const UI_ICONS: Record<string, LucideIcon> = {
  Users,
  FileText,
  CalendarDays,
  Building2,
  Handshake,
  Landmark,
  Camera,
  Trophy,
  Globe2,
  BarChart3,
  TrendingUp,
  Waypoints,
  PieChart,
};

export const UI_ICON_KEYS = Object.keys(UI_ICONS);

export function getUiIcon(key: string | null | undefined): LucideIcon {
  return (key && UI_ICONS[key]) || TrendingUp;
}

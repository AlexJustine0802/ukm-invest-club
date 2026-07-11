import {
  Building2,
  Wrench,
  MessageCircle,
  Presentation,
  Trophy,
  Share2,
  CalendarDays,
  Users,
  Mic2,
  type LucideIcon,
} from "lucide-react";

export const EVENT_ICONS: Record<string, LucideIcon> = {
  Building2,
  Wrench,
  MessageCircle,
  Presentation,
  Trophy,
  Share2,
  CalendarDays,
  Users,
  Mic2,
};

export const EVENT_ICON_KEYS = Object.keys(EVENT_ICONS);

export function getEventIcon(key: string): LucideIcon {
  return EVENT_ICONS[key] ?? CalendarDays;
}

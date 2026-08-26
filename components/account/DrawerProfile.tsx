import Link from "next/link";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";
import { logoutUser } from "@/app/account/actions";

const items = [
  { label: "My Profile", icon: User, href: "/account/profile" },
  { label: "Settings", icon: Settings, href: "/account/settings" },
  { label: "Help & Support", icon: HelpCircle, href: "/account/help" },
];

/**
 * Profile block at the foot of the mobile drawer. On a phone the avatar
 * dropdown had nowhere to open without running off the screen, so the same
 * entries live inline in the menu instead.
 */
export default function DrawerProfile({
  name,
  initial,
  role,
  photo,
}: {
  name: string;
  initial: string;
  role: string;
  photo: string | null;
}) {
  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="flex items-center gap-3 px-3 py-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-navy">{name}</p>
          <p className="truncate text-xs text-slate-400">{role}</p>
        </div>
      </div>

      {items.map((m) => (
        <Link
          key={m.label}
          href={m.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <m.icon className="h-4 w-4" />
          {m.label}
        </Link>
      ))}

      <form action={logoutUser}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </form>
    </div>
  );
}

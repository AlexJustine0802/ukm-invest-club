import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, ArrowLeft } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import AccountTopBar from "@/components/account/AccountTopBar";
import { getSection } from "@/lib/dashboardContent";
import { getUiIcon } from "@/lib/uiIcons";

export const metadata: Metadata = { title: "Announcements" };
export const dynamic = "force-dynamic";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const all = await getSection("announcement");
  const { q = "", category = "All" } = await searchParams;
  const query = q.trim().toLowerCase();

  // Categories come from whatever the admin actually used.
  const categories = [
    "All",
    ...Array.from(new Set(all.map((a) => a.badge).filter(Boolean))),
  ] as string[];

  const visible = all.filter(
    (a) =>
      (category === "All" || a.badge === category) &&
      (!query ||
        a.title.toLowerCase().includes(query) ||
        (a.subtitle ?? "").toLowerCase().includes(query)),
  );

  const categoryHref = (c: string) => {
    const params = new URLSearchParams();
    if (c !== "All") params.set("category", c);
    if (query) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/account/announcements?${qs}` : "/account/announcements";
  };

  return (
    <>
      <Link
        href="/account"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <AccountTopBar
        title="Announcements"
        subtitle="Everything happening across ICU, newest first."
        searchPlaceholder="Search announcements..."
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      {/* Always rendered — with an empty database this is just "All", so the
          row below it never moves up the page. */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {categories.map((c) => (
          <Link
            key={c}
            href={categoryHref(c)}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
              c === category
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-navy hover:bg-slate-50"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <Inbox className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-navy">No announcements found</p>
          <p className="text-sm text-slate-500">
            {all.length === 0
              ? "Nothing has been posted yet."
              : "Try a different keyword or category."}
          </p>
          {all.length > 0 && (
            <Link
              href="/account/announcements"
              className="mt-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-primary"
            >
              Reset filters
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((a) => {
            const Icon = getUiIcon(a.icon);
            return (
              <article
                key={a.id}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${a.color ?? "bg-blue-50 text-primary"}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-navy">{a.title}</h2>
                    {a.badge && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        {a.badge}
                      </span>
                    )}
                  </div>
                  {a.subtitle && (
                    <p className="mt-1 text-sm text-slate-600">{a.subtitle}</p>
                  )}
                  {a.meta && (
                    <p className="mt-1 text-xs text-slate-400">{a.meta}</p>
                  )}
                </div>
                {a.note && (
                  <span className="shrink-0 text-xs text-slate-400">{a.note}</span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

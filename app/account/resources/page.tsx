import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderClosed, SearchX } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import AccountTopBar from "@/components/account/AccountTopBar";
import InlineSearch from "@/components/account/InlineSearch";
import { getSection } from "@/lib/dashboardContent";
import { getUiIcon } from "@/lib/uiIcons";

export const metadata: Metadata = { title: "Resources" };
export const dynamic = "force-dynamic";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const folders = await getSection("folder");
  const { q = "", category = "All" } = await searchParams;
  const query = q.trim().toLowerCase();

  // Categories come from whatever the admin actually used.
  const categories = [
    "All",
    ...Array.from(new Set(folders.map((f) => f.badge).filter(Boolean))),
  ] as string[];

  const visible = folders.filter(
    (f) =>
      (category === "All" || f.badge === category) &&
      (!query ||
        f.title.toLowerCase().includes(query) ||
        (f.badge ?? "").toLowerCase().includes(query)),
  );

  // Keep the active search when switching category.
  const categoryHref = (c: string) => {
    const params = new URLSearchParams();
    if (c !== "All") params.set("category", c);
    if (query) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/account/resources?${qs}` : "/account/resources";
  };

  return (
    <>
      <AccountTopBar
        title="Resources"
        subtitle="Your central library for learning materials, research, templates, and more."
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      {/* Category filters  pills scroll horizontally so the search button on
          the right stays on the same line however many categories exist. */}
      <div className="mt-8 flex items-center gap-3">
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:thin]">
          <div className="flex w-max items-center gap-2 pb-1">
            {categories.map((c) => (
              <Link
                key={c}
                href={categoryHref(c)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold ${
                  c === category
                    ? "bg-primary text-white"
                    : "border border-slate-200 bg-white text-navy hover:bg-slate-50"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
        <div className="shrink-0">
          <InlineSearch placeholder="Search resources..." />
        </div>
      </div>

      {query && (
        <p className="mt-4 text-sm text-slate-500">
          {visible.length} result{visible.length === 1 ? "" : "s"} for{" "}
          <span className="font-semibold text-navy">&ldquo;{q.trim()}&rdquo;</span>
        </p>
      )}

      {/* Folders */}
      {visible.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <SearchX className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-navy">No resources found</p>
          <p className="text-sm text-slate-500">
            {folders.length === 0
              ? "No folders have been added yet."
              : "Try a different keyword or category."}
          </p>
          {folders.length > 0 && (
            <Link
              href="/account/resources"
              className="mt-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-primary"
            >
              Reset filters
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visible.map((f) => {
            const Icon = getUiIcon(f.icon);
            return (
              <Link
                key={f.id}
                href={f.href || "/publications"}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md"
              >
                <div
                  className={`relative flex h-36 items-end p-5 ${f.color ?? "bg-blue-500"}`}
                >
                  <Icon className="absolute right-4 top-4 h-16 w-16 text-white/20" />
                  <p className="relative text-xl font-bold leading-tight text-white">
                    {f.title}
                  </p>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <p className="text-sm text-slate-500">{f.meta}</p>
                  <FolderClosed className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

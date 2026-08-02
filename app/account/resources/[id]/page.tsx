import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, FolderOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import AccountTopBar from "@/components/account/AccountTopBar";
import { getUiIcon } from "@/lib/uiIcons";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Resource folder" };
export const dynamic = "force-dynamic";

export default async function ResourceFolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const { id } = await params;

  const folder = await prisma.dashboardItem.findFirst({
    where: { id, section: "folder", active: true },
    include: {
      materials: {
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!folder) notFound();

  const Icon = getUiIcon(folder.icon);

  return (
    <>
      <AccountTopBar
        title={folder.title}
        subtitle={folder.badge ?? "Resource folder"}
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <Link
        href="/account/resources"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Resources
      </Link>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-navy">Materials</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">
              {folder.materials.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Everything shared in this folder.
            </p>
          </div>
          {folder.href && (
            <a
              href={folder.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-primary hover:bg-slate-50"
            >
              Open linked drive
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </aside>

        <section>
          {folder.materials.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
              <FolderOpen className="h-10 w-10 text-slate-300" />
              <p className="font-semibold text-navy">Nothing shared yet</p>
              <p className="text-sm text-slate-500">
                Materials added to this folder will show up here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {folder.materials.map((m) => (
                <li key={m.id}>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary hover:shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-navy">
                        {m.title}
                      </span>
                      {m.description && (
                        <span className="mt-1 block text-sm text-slate-600">
                          {m.description}
                        </span>
                      )}
                      <span className="mt-2 block text-xs text-slate-400">
                        {m.meta ? `${m.meta} · ` : ""}
                        Posted {formatDate(m.createdAt)}
                      </span>
                    </span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

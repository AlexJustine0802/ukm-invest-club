"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Mail, Phone, Shield, CalendarDays } from "lucide-react";
import { InstagramIcon, LinkedInIcon } from "@/components/BrandIcons";

export interface MemberDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  divisionLabel: string | null;
  bio: string | null;
  instagram: string | null;
  linkedin: string | null;
  photo: string | null;
  joined: string;
  isHead: boolean;
}

/**
 * The clickable summary on a member row, plus the dialog it opens.
 *
 * A dialog rather than a page: looking someone up is a glance, and a page
 * would lose the filter and search the admin just typed. Only the summary is
 * the trigger  the role controls beside it stay independently clickable.
 */
export default function MemberDetailsCard({
  member,
  showRole,
}: {
  member: MemberDetails;
  /** Role and division are only shown to admins who manage them. */
  showRole: boolean;
}) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] =
    [
      {
        icon: <Mail className="h-4 w-4" />,
        label: "Email",
        value: (
          <a
            href={`mailto:${member.email}`}
            className="font-semibold text-primary hover:underline"
          >
            {member.email}
          </a>
        ),
      },
      {
        icon: <Phone className="h-4 w-4" />,
        label: "Phone",
        value: member.phone ?? "-",
      },
      {
        icon: <Shield className="h-4 w-4" />,
        label: "Position",
        value: showRole
          ? `${member.role}${member.divisionLabel ? ` · ${member.divisionLabel}` : ""}`
          : member.role,
      },
      {
        icon: <CalendarDays className="h-4 w-4" />,
        label: "Member since",
        value: member.joined,
      },
    ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-m-2 flex min-w-0 flex-1 items-center gap-4 rounded-xl p-2 text-left hover:bg-slate-50"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-primary">
          {member.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-navy">{member.name}</span>
            {showRole && member.isHead && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-primary-dark">
                Head
              </span>
            )}
          </span>
          <span className="block truncate text-sm text-slate-500">
            {member.email}
          </span>
          <span className="mt-1 block text-xs text-slate-400">
            {showRole && (
              <>
                {member.role}
                {member.divisionLabel ? ` · ${member.divisionLabel}` : ""} ·{" "}
              </>
            )}
            joined {member.joined}
          </span>
        </span>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            // Clicking the backdrop closes it; clicks inside the card do not
            // bubble out to here.
            onClick={() => setOpen(false)}
          >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={member.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                {member.photo ? (
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </span>
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-lg font-bold text-navy">{member.name}</p>
                  <p className="text-sm text-slate-500">
                    {showRole
                      ? `${member.role}${member.divisionLabel ? ` · ${member.divisionLabel}` : ""}`
                      : member.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-6 space-y-4">
              {rows.map((r) => (
                <div key={r.label} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-slate-400">
                    {r.icon}
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-400">{r.label}</dt>
                    <dd className="break-words text-sm font-semibold text-navy">
                      {r.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            {member.bio && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <p className="text-xs text-slate-400">Bio</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                  {member.bio}
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
              {member.instagram || member.linkedin ? (
                <>
                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on Instagram`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <InstagramIcon className="h-5 w-5" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <LinkedInIcon className="h-5 w-5" />
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400">No social links added.</p>
              )}
            </div>
          </div>
          </div>,
          document.body,
        )}
    </>
  );
}

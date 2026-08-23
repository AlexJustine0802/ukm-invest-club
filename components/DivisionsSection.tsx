"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Users, X } from "lucide-react";
import { InstagramIcon, LinkedInIcon } from "@/components/BrandIcons";
import { TextAnimate } from "@/components/ui/text-animate";
import { DUR, EASE } from "@/lib/motion";

const DIVISION_LOGOS: Record<string, string> = {
  pvpc: "/images/divisions/PVP.png",
  "finance-legality": "/images/divisions/FNL.png",
  "human-resource-development": "/images/divisions/HRD.png",
  "external-relationship": "/images/divisions/ERBD.png",
  "creative-brand-marketing": "/images/divisions/CBM.png",
  "project-management": "/images/divisions/PM.png",
  "research-development": "/images/divisions/RND.png",
};

/**
 * A person on the public page is a member account (see /admin/members)  email
 * is deliberately left out so a public page never lists member addresses.
 */
export interface DivisionMemberView {
  id: string;
  name: string;
  role: string;
  isHead: boolean;
  photo: string | null;
  bio: string | null;
  instagram: string | null;
  linkedin: string | null;
}

export interface DivisionView {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  icon: string | null;
  members: DivisionMemberView[];
}

function MemberCard({
  member,
  featured,
}: {
  member: DivisionMemberView;
  featured?: boolean;
}) {
  const links = [
    member.instagram && {
      href: member.instagram,
      icon: InstagramIcon,
      label: `${member.name} on Instagram`,
    },
    member.linkedin && {
      href: member.linkedin,
      icon: LinkedInIcon,
      label: `${member.name} on LinkedIn`,
    },
  ].filter(Boolean) as {
    href: string;
    icon: typeof InstagramIcon;
    label: string;
  }[];

  return (
    <div
      className={`card flex gap-4 p-5 ${featured ? "sm:col-span-2 sm:p-6" : ""}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-slate-200 ${
          featured ? "h-28 w-28" : "h-20 w-20"
        }`}
      >
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            className="object-cover"
            sizes={featured ? "112px" : "80px"}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Users className={featured ? "h-10 w-10" : "h-7 w-7"} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {member.role}
        </p>
        <h4
          className={`font-bold text-navy ${featured ? "text-xl" : "text-base"}`}
        >
          {member.name}
        </h4>
        {member.bio && (
          <p className="mt-2 text-sm text-slate-600">{member.bio}</p>
        )}

        {links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white hover:border-primary/60"
              >
                <l.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Columns in the grid below  must track the sm/lg breakpoints in the JSX. */
function useColumnCount() {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const update = () =>
      setColumns(
        window.matchMedia("(min-width: 1024px)").matches
          ? 3
          : window.matchMedia("(min-width: 640px)").matches
            ? 2
            : 1,
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return columns;
}

export default function DivisionsSection({
  divisions,
}: {
  divisions: DivisionView[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const columns = useColumnCount();

  const openIndex = divisions.findIndex((d) => d.id === openId);
  const open = openIndex >= 0 ? divisions[openIndex] : null;

  // Put the panel after the LAST card on the open card's row, so the cards
  // sharing that row stay beside it instead of being pushed below the panel.
  const panelAfterIndex =
    openIndex < 0
      ? -1
      : Math.min(
          Math.floor(openIndex / columns) * columns + columns - 1,
          divisions.length - 1,
        );

  const head = open?.members.find((m) => m.isHead) ?? null;
  const managers = open?.members.filter((m) => !m.isHead) ?? [];

  return (
    <section id="divisions" className="container-page py-16">
      <TextAnimate
        as="span"
        animation="blurInUp"
        by="character"
        once
        className="block text-sm font-semibold uppercase tracking-widest text-primary"
      >
        Our Divisions
      </TextAnimate>
      <TextAnimate
        as="h2"
        animation="blurInUp"
        by="character"
        once
        className="mt-3 max-w-2xl text-3xl font-bold text-navy"
      >
        The teams that make it happen
      </TextAnimate>
      <TextAnimate
        as="p"
        animation="blurInUp"
        by="word"
        once
        className="mt-3 max-w-2xl text-slate-600"
      >
        Select a division to see what they do and who leads it.
      </TextAnimate>

      {/* The open panel is a full-width grid item placed straight after its
          card, so the browser drops it under that card's row on its own 
          correct at 1, 2 or 3 columns without measuring anything. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {divisions.map((d, index) => {
          const logo = DIVISION_LOGOS[d.slug];
          const isOpen = d.id === openId;

          return (
            <Fragment key={d.id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : d.id)}
                aria-expanded={isOpen}
                className={`card p-6 text-left transition ${
                  isOpen
                    ? "ring-2 ring-primary"
                    : "hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-dark p-2">
                  {logo && (
                    <Image
                      src={logo}
                      alt={`${d.name} logo`}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                    />
                  )}
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy">{d.name}</h3>
                {d.tagline && (
                  <p className="mt-1 text-sm text-slate-500">{d.tagline}</p>
                )}
                <span className="mt-3 inline-block text-sm font-semibold text-primary">
                  {isOpen ? "Hide details" : "View details →"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open && index === panelAfterIndex && (
                  <motion.div
                    key={open.id}
                    initial={{ opacity: 0, y: -16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.99 }}
                    transition={{ duration: DUR.ui, ease: EASE }}
                    style={{ gridColumn: "1 / -1" }}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8"
                  >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-navy">
                        {open.name}
                      </h3>
                      {open.tagline && (
                        <p className="mt-1 text-sm font-medium text-primary">
                          {open.tagline}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenId(null)}
                      aria-label="Close division details"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 hover:text-navy"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {open.description && (
                    <p className="mt-4 max-w-3xl text-slate-600">
                      {open.description}
                    </p>
                  )}

                  {open.members.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-500">
                      Members for this division will be announced soon.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-6">
                      {head && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Head of Division
                          </p>
                          <div className="mt-3 grid gap-4 sm:grid-cols-2">
                            <MemberCard member={head} featured />
                          </div>
                        </div>
                      )}

                      {managers.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Managers
                          </p>
                          <div className="mt-3 grid gap-4 sm:grid-cols-2">
                            {managers.map((m) => (
                              <MemberCard key={m.id} member={m} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

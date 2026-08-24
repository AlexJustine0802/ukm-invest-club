"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Card = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  href: string;
};

export default function WaGroupGrid({ cards }: { cards: Card[] }) {
  const [active, setActive] = useState<Card | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setActive(card)}
            aria-label={`Open ${card.title}`}
            className="card group overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-navy">
              {card.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center p-5 text-center font-bold uppercase text-white">{card.title}</div>
              )}
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-navy group-hover:text-primary">{card.title}</h2>
              {card.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{card.description}</p>}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" aria-label="Close dialog" onClick={() => setActive(null)} className="absolute inset-0 bg-navy-dark/60" />
          <section role="dialog" aria-modal="true" aria-labelledby="wa-group-dialog-title" className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button type="button" aria-label="Close dialog" onClick={() => setActive(null)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-navy"><X className="h-5 w-5" /></button>
            <h2 id="wa-group-dialog-title" className="pr-10 text-xl font-bold text-navy">{active.title}</h2>
            {active.description && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{active.description}</p>}
            <a href={active.href} target="_blank" rel="noreferrer" className="mt-6 block rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark">Open WhatsApp Group</a>
          </section>
        </div>
      )}
    </>
  );
}

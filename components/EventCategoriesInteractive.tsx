"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { getEventIcon } from "@/lib/eventIcons";
import EmptyState from "@/components/EmptyState";

export type CategoryPreviewEvent = {
  slug: string;
  title: string;
  dateLabel: string;
  href: string;
};

export type EventCategoryWithPreview = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string;
  events: CategoryPreviewEvent[];
};

function CategoryPanel({ category }: { category: EventCategoryWithPreview }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-blue-50/70 p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase text-primary">
            Selected Category
          </p>
          <h3 className="mt-1 text-xl font-bold text-navy">
            {category.title}
          </h3>
        </div>
        <Link
          href={`/events/all?category=${category.slug}`}
          className="btn-secondary bg-white"
        >
          View More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {category.events.length > 0 ? (
          category.events.map((event) => (
            <Link
              key={event.slug}
              href={event.href}
              className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-primary"
            >
              <span className="text-xs font-bold uppercase text-primary">
                {event.dateLabel}
              </span>
              <h4 className="mt-2 text-base font-bold text-navy">
                {event.title}
              </h4>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-500 md:col-span-3">
            No upcoming events in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default function EventCategoriesInteractive({
  categories,
}: {
  categories: EventCategoryWithPreview[];
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // The block keeps its footprint with no categories, so the sections below it
  // do not slide up.
  if (categories.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-slate-200 bg-white">
        <EmptyState message="Event categories will appear here soon" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {categories.map((category) => {
          const Icon = getEventIcon(category.icon);
          const active = category.id === activeCategory?.id;
          return (
            <div key={category.id}>
              <button
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`w-full rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                  active
                    ? "border-primary ring-1 ring-primary"
                    : "border-slate-200"
                }`}
              >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-primary">
                  <Icon className="h-8 w-8" />
                </span>
                <h3 className="mt-5 text-base font-extrabold text-navy">
                  {category.title}
                </h3>
                {category.description && (
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                    {category.description}
                  </p>
                )}
              </button>

              {/* Mobile: drop down right below the selected category */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
                  active ? "mt-4 max-h-[640px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <CategoryPanel category={category} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / tablet: single panel below the whole grid */}
      {activeCategory && (
        <div className="mt-6 hidden sm:block">
          <CategoryPanel category={activeCategory} />
        </div>
      )}
    </div>
  );
}

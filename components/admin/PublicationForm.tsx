"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";

interface PublicationFormProps {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  categories: { id: string; title: string }[];
  publication?: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string | null;
    coverImage: string | null;
    published: boolean;
    publishedAt: Date;
    categoryId: string | null;
    featured: boolean;
    featuredOrder: number;
    pageCount: number | null;
    badge: string | null;
  };
}

function toDateValue(date: Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

export default function PublicationForm({
  action,
  uploadEnabled,
  categories,
  publication,
}: PublicationFormProps) {
  return (
    <form action={action} className="space-y-5">
      {publication && <input type="hidden" name="id" value={publication.id} />}

      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={publication?.title}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="label">
          Excerpt <span className="text-slate-400">(short summary)</span>
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          required
          defaultValue={publication?.excerpt}
          className="input resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="author" className="label">
            Author
          </label>
          <input
            id="author"
            name="author"
            defaultValue={publication?.author ?? ""}
            placeholder="e.g. ICUnpar Research Team"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="publishedAt" className="label">
            Publish date
          </label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="date"
            defaultValue={
              publication
                ? toDateValue(publication.publishedAt)
                : toDateValue(new Date())
            }
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="label">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={publication?.categoryId ?? ""}
          className="input"
        >
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={publication?.featured ?? false}
            className="h-4 w-4 rounded border-slate-300"
          />
          Feature in research hero slideshow
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="featuredOrder" className="label">
              Hero order
            </label>
            <input
              id="featuredOrder"
              name="featuredOrder"
              type="number"
              defaultValue={publication?.featuredOrder ?? 0}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="pageCount" className="label">
              Page count
            </label>
            <input
              id="pageCount"
              name="pageCount"
              type="number"
              min={0}
              defaultValue={publication?.pageCount ?? ""}
              placeholder="e.g. 24"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="badge" className="label">
              Hero badge
            </label>
            <select
              id="badge"
              name="badge"
              defaultValue={publication?.badge ?? ""}
              className="input"
            >
              <option value="">Defaults to category name</option>
              {categories.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="label">
          Content <span className="text-slate-400">(Markdown supported)</span>
        </label>
        <textarea
          id="content"
          name="content"
          rows={16}
          required
          defaultValue={publication?.content}
          className="input resize-y font-mono text-sm"
        />
      </div>

      <ImageField
        label="Cover image"
        defaultUrl={publication?.coverImage}
        uploadEnabled={uploadEnabled}
      />

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          name="published"
          defaultChecked={publication ? publication.published : true}
          className="h-4 w-4 rounded border-slate-300"
        />
        Published (visible on the website)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton
          label={publication ? "Save changes" : "Create publication"}
        />
        <Link href="/admin/publications" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}

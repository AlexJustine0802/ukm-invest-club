"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import CategorySelect, {
  type CategoryOption,
} from "@/components/admin/CategorySelect";

interface PublicationFormProps {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  categories: { id: string; title: string }[];
  createCategory?: (
    title: string,
  ) => Promise<CategoryOption | { error: string }>;
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
  createCategory,
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
            placeholder="e.g. Parahyangan Finance Club Research Team"
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

      <CategorySelect
        name="categoryId"
        label="Category"
        defaultValue={publication?.categoryId}
        options={categories.map((c) => ({ value: c.id, label: c.title }))}
        createAction={createCategory}
        hint="This category will also be available in Research Categories."
      />

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

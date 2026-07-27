import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { UI_ICON_KEYS } from "@/lib/uiIcons";
import { EVENT_COLOR_KEYS } from "@/lib/eventStyles";

interface DiscussionChannelFormProps {
  action: (formData: FormData) => void;
  channel?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    order: number;
    published: boolean;
  };
}

export default function DiscussionChannelForm({
  action,
  channel,
}: DiscussionChannelFormProps) {
  return (
    <form action={action} className="space-y-5">
      {channel && <input type="hidden" name="id" value={channel.id} />}

      <div>
        <label htmlFor="name" className="label">
          Channel name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={channel?.name}
          placeholder="e.g. Stock Market Talk"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="slug" className="label">
          Slug <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={channel?.slug}
          placeholder="left blank = made from the name"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={channel?.description ?? ""}
          placeholder="What this channel is for."
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="icon" className="label">
            Icon
          </label>
          <select
            id="icon"
            name="icon"
            defaultValue={channel?.icon ?? "MessageSquare"}
            className="input"
          >
            {UI_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="color" className="label">
            Colour
          </label>
          <select
            id="color"
            name="color"
            defaultValue={channel?.color ?? EVENT_COLOR_KEYS[0]}
            className="input"
          >
            {EVENT_COLOR_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="order" className="label">
            Display order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={channel?.order ?? 0}
            className="input"
          />
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="published"
          defaultChecked={channel ? channel.published : true}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Published  members can find and join it
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={channel ? "Save changes" : "Add channel"} />
        <Link href="/admin/discussions" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}

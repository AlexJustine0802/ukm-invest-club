"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/slugs";

function revalidateDiscussions() {
  revalidatePath("/admin/discussions");
  revalidatePath("/account/discussions");
}

function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const name = (formData.get("name") as string).trim();

  return {
    name,
    slug: slugify(str("slug") || name),
    description: str("description"),
    icon: str("icon"),
    color: str("color"),
    order: Number(formData.get("order")) || 0,
    published: formData.get("published") === "on",
  };
}

const lookupChannel = (slug: string) =>
  prisma.discussionChannel.findUnique({ where: { slug } });

export async function createChannel(formData: FormData) {
  await requireSession();
  const data = dataFrom(formData);
  // Channel slugs are unique; a repeated name would otherwise throw P2002.
  const slug = await uniqueSlug(lookupChannel, data.slug, "channel");
  await prisma.discussionChannel.create({ data: { ...data, slug } });
  revalidateDiscussions();
  redirect("/admin/discussions");
}

export async function updateChannel(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const data = dataFrom(formData);
  const existing = await prisma.discussionChannel.findUnique({
    where: { id },
    select: { slug: true },
  });
  const slug = await uniqueSlug(lookupChannel, data.slug, "channel", id);
  await prisma.discussionChannel.update({
    where: { id },
    data: { ...data, slug },
  });
  revalidateDiscussions();
  // The old slug had its own cached path; drop it too when the slug changed.
  if (existing && existing.slug !== slug) {
    revalidatePath(`/account/discussions/${existing.slug}`);
  }
  revalidatePath(`/account/discussions/${slug}`);
  redirect("/admin/discussions");
}

export async function deleteChannel(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await deleteIfExists(() =>
    prisma.discussionChannel.delete({ where: { id } }),
  );
  revalidateDiscussions();
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

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

export async function createChannel(formData: FormData) {
  await requireSession();
  await prisma.discussionChannel.create({ data: dataFrom(formData) });
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
  await prisma.discussionChannel.update({ where: { id }, data });
  revalidateDiscussions();
  // The old slug had its own cached path; drop it too when the slug changed.
  if (existing && existing.slug !== data.slug) {
    revalidatePath(`/account/discussions/${existing.slug}`);
  }
  revalidatePath(`/account/discussions/${data.slug}`);
  redirect("/admin/discussions");
}

export async function deleteChannel(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await prisma.discussionChannel.delete({ where: { id } });
  revalidateDiscussions();
}

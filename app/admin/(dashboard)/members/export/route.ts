import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/adminAccess";
import { DIVISIONS, divisionName } from "@/lib/roles";
import { buildSheet, XLSX_CONTENT_TYPE } from "@/lib/xlsx";

/**
 * The member directory as an Excel workbook.
 *
 * Takes the same `division` and `q` the page is showing, so the file matches
 * what the admin is looking at rather than always being everyone.
 */
export async function GET(request: Request) {
  // The /admin proxy only checks that *a* session exists. A bulk export of
  // people's contact details re-checks the specific permission.
  if (!(await can("members", "export"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Role and division belong to the super admin, so a role without that
  // permission exports the directory without the org chart around it.
  const manages = await can("member-roles", "edit");

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const divisionParam = url.searchParams.get("division");
  const division =
    manages &&
    divisionParam &&
    (divisionParam === "none" || DIVISIONS.some((d) => d.slug === divisionParam))
      ? divisionParam
      : "all";

  // Explicit select — never pull passwordHash out of the database.
  const members = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      division: true,
      instagram: true,
      linkedin: true,
      createdAt: true,
    },
    orderBy: [{ division: "asc" }, { name: "asc" }],
  });

  const visible = members.filter(
    (m) =>
      (division === "all" ||
        (division === "none" ? m.division === null : m.division === division)) &&
      (!query ||
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (manages && m.role.toLowerCase().includes(query))),
  );

  const columns = [
    { header: "Name", width: 28 },
    { header: "Email", width: 34 },
    { header: "Phone", width: 18 },
    ...(manages
      ? [
          { header: "Position", width: 26 },
          { header: "Division", width: 28 },
        ]
      : []),
    { header: "Instagram", width: 32 },
    { header: "LinkedIn", width: 32 },
    { header: "Member since", width: 16 },
  ];

  const rows = visible.map((m) => [
    m.name,
    m.email,
    // Kept as text: a leading "0" or a "+62" prefix is part of the number, and
    // Excel would otherwise read it as a numeric value and drop them.
    m.phone ?? "",
    ...(manages ? [m.role, divisionName(m.division) || ""] : []),
    m.instagram ?? "",
    m.linkedin ?? "",
    m.createdAt.toISOString().slice(0, 10),
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  const file = await buildSheet("Members", columns, rows);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="members-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

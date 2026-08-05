import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/adminAccess";
import {
  parseQuestions,
  parseAnswers,
  answerText,
  flattenQuestions,
} from "@/lib/forms";
import { slugify } from "@/lib/utils";
import { buildSheet, XLSX_CONTENT_TYPE } from "@/lib/xlsx";

/**
 * One Excel sheet per form: a header row of question labels, then a row per
 * response.
 *
 * A workbook rather than a CSV because Excel guesses a CSV's separator from
 * the machine's locale — a comma-separated file lands in a single column on
 * anything set to Indonesian. Answers also routinely contain commas and line
 * breaks, which a sheet carries without quoting rules to get wrong.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // The /admin proxy only checks that *a* session exists; a bulk export of
  // people's answers re-checks the specific permission.
  if (!(await can("registrations", "export"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const form = await prisma.registrationForm.findUnique({
    where: { id },
    include: {
      responses: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
  if (!form) return new NextResponse("Not found", { status: 404 });

  const questions = flattenQuestions(parseQuestions(form.questions));

  const columns = [
    { header: "Submitted at", width: 20 },
    { header: "Name", width: 26 },
    { header: "Email", width: 32 },
    { header: "Account", width: 12 },
    // An essay answer needs room; a one-word one does not suffer from having it.
    ...questions.map((q) => ({ header: q.label, width: 34 })),
  ];

  const rows = form.responses.map((r) => {
    const answers = parseAnswers(r.answers);
    return [
      // Local time, not an ISO string: this column is read by people.
      r.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }),
      r.user?.name ?? r.guestName ?? "",
      r.user?.email ?? r.guestEmail ?? "",
      r.user ? "Member" : "Guest",
      ...questions.map((q) => answerText(answers[q.id])),
    ];
  });

  const stamp = new Date().toISOString().slice(0, 10);
  const file = await buildSheet(form.title || "Responses", columns, rows);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="${slugify(form.title) || "responses"}-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

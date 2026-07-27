import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/adminAccess";
import { parseQuestions, parseAnswers, answerText, toCsv } from "@/lib/forms";
import { slugify } from "@/lib/utils";

/**
 * One CSV per form: a header row of question labels, then a row per response.
 * Opens directly in Google Sheets (File → Import) or Excel.
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

  const questions = parseQuestions(form.questions);

  const rows: string[][] = [
    ["Submitted at", "Name", "Email", "Account", ...questions.map((q) => q.label)],
    ...form.responses.map((r) => {
      const answers = parseAnswers(r.answers);
      return [
        r.createdAt.toISOString(),
        r.user?.name ?? r.guestName ?? "",
        r.user?.email ?? r.guestEmail ?? "",
        r.user ? "Member" : "Guest",
        ...questions.map((q) => answerText(answers[q.id])),
      ];
    }),
  ];

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slugify(form.title) || "responses"}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

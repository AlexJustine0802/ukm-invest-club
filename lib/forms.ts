// Shape of a registration form's questions and answers. Both live in JSON
// columns (RegistrationForm.questions, FormResponse.answers), so this module is
// the single place that knows the format  admin editor, member form, CSV
// export and validation all read it from here.

export const QUESTION_TYPES = [
  { id: "SHORT_TEXT", label: "Short answer" },
  { id: "LONG_TEXT", label: "Long answer / essay" },
  { id: "CHOICE", label: "Multiple choice (pick one)" },
  { id: "CHECKBOX", label: "Checkboxes (pick many)" },
  { id: "DROPDOWN", label: "Dropdown" },
  { id: "DATE", label: "Date" },
  { id: "FILE", label: "File or picture upload" },
  // Not a question: everything after it is the next section of the form.
  { id: "PAGE_BREAK", label: "── Section break ──" },
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number]["id"];

export function isQuestionType(value: string): value is QuestionType {
  return QUESTION_TYPES.some((t) => t.id === value);
}

/** Types whose answers come from a fixed option list. */
export const CHOICE_TYPES: QuestionType[] = ["CHOICE", "CHECKBOX", "DROPDOWN"];

export const DEFAULT_MAX_MB = 3;
/** Hard ceiling regardless of what an admin types, to protect the blob store. */
export const MAX_MB_LIMIT = 10;

export interface FormQuestion {
  id: string;
  type: QuestionType;
  label: string;
  helpText?: string;
  required: boolean;
  /** CHOICE / CHECKBOX / DROPDOWN only. */
  options?: string[];
  /** FILE only, in megabytes. */
  maxMb?: number;
  /**
   * DROPDOWN only: follow-up questions per answer, keyed by the option.
   *
   * Picking "Informatics" shows that option's questions and nothing else, so
   * one form can ask each group what only that group needs to answer. They are
   * nested rather than flagged flat so a branch moves, copies and deletes with
   * the question it hangs off.
   */
  branches?: Record<string, FormQuestion[]>;
}

/** How deep branches may nest. A branch inside a branch inside a branch is a
 * questionnaire nobody can fill in, and it bounds the recursion below. */
export const MAX_BRANCH_DEPTH = 3;

/** Answers keyed by question id. Arrays are checkbox answers. */
export type FormAnswers = Record<string, string | string[]>;

export const AUDIENCES = [
  { id: "MEMBERS", label: "Members only", hint: "Signed-in members only." },
  {
    id: "PUBLIC",
    label: "Public only",
    hint: "Anyone with the link, no account needed.",
  },
  {
    id: "BOTH",
    label: "Members and public",
    hint: "Open to everyone; members are recorded by name.",
  },
] as const;

export type Audience = (typeof AUDIENCES)[number]["id"];

export function isAudience(value: string): value is Audience {
  return AUDIENCES.some((a) => a.id === value);
}

export function allowsGuests(audience: string): boolean {
  return audience === "PUBLIC" || audience === "BOTH";
}

export function allowsMembers(audience: string): boolean {
  return audience === "MEMBERS" || audience === "BOTH";
}

/**
 * Read the questions JSON column back into typed questions, dropping anything
 * malformed rather than throwing  a half-broken form should still render.
 */
export function parseQuestions(
  value: unknown,
  depth = 0,
): FormQuestion[] {
  if (!Array.isArray(value)) return [];
  const out: FormQuestion[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const q = raw as Record<string, unknown>;
    if (typeof q.id !== "string" || typeof q.label !== "string") continue;
    if (typeof q.type !== "string" || !isQuestionType(q.type)) continue;

    // Branches are read back the same way, one level down. Past the depth
    // limit they are simply dropped, which cannot loop however the JSON looks.
    let branches: Record<string, FormQuestion[]> | undefined;
    if (
      q.type === "DROPDOWN" &&
      // Same rule the editor enforces, so what it lets you build is exactly
      // what reads back.
      depth + 1 < MAX_BRANCH_DEPTH &&
      q.branches &&
      typeof q.branches === "object" &&
      !Array.isArray(q.branches)
    ) {
      const parsed: Record<string, FormQuestion[]> = {};
      for (const [option, list] of Object.entries(
        q.branches as Record<string, unknown>,
      )) {
        const questions = parseQuestions(list, depth + 1);
        if (questions.length) parsed[option] = questions;
      }
      if (Object.keys(parsed).length) branches = parsed;
    }

    out.push({
      id: q.id,
      type: q.type,
      label: q.label,
      helpText: typeof q.helpText === "string" ? q.helpText : undefined,
      required: q.required !== false,
      // A blank option is one the admin started and never named: it would
      // render as an empty row nobody can meaningfully pick.
      options: Array.isArray(q.options)
        ? q.options
            .filter((o): o is string => typeof o === "string")
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined,
      maxMb:
        typeof q.maxMb === "number" && q.maxMb > 0
          ? Math.min(q.maxMb, MAX_MB_LIMIT)
          : undefined,
      branches,
    });
  }
  return out;
}

/**
 * The form split into sections on its section breaks.
 *
 * Always at least one section, so a form with no breaks is simply one page and
 * the fill component needs no special case for it.
 */
export function sectionsOf(questions: FormQuestion[]): FormQuestion[][] {
  const sections: FormQuestion[][] = [[]];
  for (const q of questions) {
    if (q.type === "PAGE_BREAK") sections.push([]);
    else sections[sections.length - 1].push(q);
  }
  // An empty section is a break with nothing after it (or two in a row): a
  // blank page with a Next button on it, so it is dropped.
  const filled = sections.filter((s) => s.length > 0);
  return filled.length > 0 ? filled : [[]];
}

/**
 * Every real question, branches included, in the order they are asked.
 *
 * The responses table and the CSV are flat, so they need one column per
 * question wherever it lives  a branch answer is still an answer.
 */
export function flattenQuestions(questions: FormQuestion[]): FormQuestion[] {
  const out: FormQuestion[] = [];
  for (const q of questions) {
    if (q.type === "PAGE_BREAK") continue;
    out.push(q);
    for (const list of Object.values(q.branches ?? {})) {
      out.push(...flattenQuestions(list));
    }
  }
  return out;
}

export function parseAnswers(value: unknown): FormAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: FormAnswers = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") out[key] = v;
    else if (Array.isArray(v))
      out[key] = v.filter((x): x is string => typeof x === "string");
  }
  return out;
}

/** One answer as a single cell of text  used by the table and the CSV. */
export function answerText(answer: string | string[] | undefined): string {
  if (answer === undefined) return "";
  return Array.isArray(answer) ? answer.join(", ") : answer;
}

/** Whether a form is accepting submissions right now. */
export function formStatus(
  form: {
    published: boolean;
    opensAt: Date | null;
    closesAt: Date | null;
    /** Optional so callers selecting fewer columns still type-check. */
    registrationEnabled?: boolean;
  },
  now: Date = new Date(),
): "open" | "closed" | "not-yet" | "hidden" {
  // Registration switched off entirely: not open, and not "opening later".
  if (form.registrationEnabled === false) return "hidden";
  if (!form.published) return "hidden";
  if (form.opensAt && form.opensAt > now) return "not-yet";
  if (form.closesAt && form.closesAt < now) return "closed";
  return "open";
}

/**
 * Questions every event sign-up form starts with. The admin can edit, remove or
 * add to them under Registrations  this is just a sensible starting point so
 * "Register" always opens a real form.
 */
export function defaultEventQuestions(): FormQuestion[] {
  const id = (suffix: string) =>
    `q${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}${suffix}`;

  return [
    {
      id: id("a"),
      type: "SHORT_TEXT",
      label: "Full name",
      required: true,
    },
    {
      id: id("b"),
      type: "SHORT_TEXT",
      label: "Student ID / NPM",
      helpText: "Write “-” if you are not an Unpar student.",
      required: true,
    },
    {
      id: id("c"),
      type: "SHORT_TEXT",
      label: "WhatsApp number",
      required: true,
    },
    {
      id: id("d"),
      type: "LONG_TEXT",
      label: "Anything we should know?",
      helpText: "Questions, dietary needs, or leave this blank.",
      required: false,
    },
  ];
}

/** RFC 4180 quoting: wrap in quotes and double any quote inside. */
export function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function toCsv(rows: string[][]): string {
  // The BOM makes Excel and Google Sheets read UTF-8 correctly on import.
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

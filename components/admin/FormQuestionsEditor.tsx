"use client";

import { useState } from "react";
import {
  QUESTION_TYPES,
  CHOICE_TYPES,
  DEFAULT_MAX_MB,
  MAX_MB_LIMIT,
  MAX_BRANCH_DEPTH,
  containsEmailQuestion,
  type FormQuestion,
  type QuestionType,
} from "@/lib/forms";

/**
 * The question builder. Everything is kept in local state and serialised into
 * one hidden input, so the whole form saves through the same plain server
 * action as every other admin page  no per-question endpoints.
 */
export default function FormQuestionsEditor({
  name,
  initial,
  emailSubject,
  emailBody,
}: {
  name: string;
  initial: FormQuestion[];
  emailSubject?: string | null;
  emailBody?: string | null;
}) {
  const [questions, setQuestions] = useState<FormQuestion[]>(initial);
  const hasEmailQuestion = containsEmailQuestion(questions);

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(questions)} />
      <QuestionList questions={questions} onChange={setQuestions} depth={0} />
      {hasEmailQuestion && (
        <div className="card space-y-5 border-primary/20 bg-blue-50/30 p-5">
          <div>
            <p className="font-bold text-navy">Email notification</p>
            <p className="mt-1 text-sm text-slate-500">
              An email will be sent to every valid address entered in the Email
              question above. This works for both member and public
              submissions. Leave either field empty to disable the email.
            </p>
          </div>

          <div>
            <label htmlFor="emailSubject" className="label">
              Email subject <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="emailSubject"
              name="emailSubject"
              defaultValue={emailSubject ?? ""}
              placeholder="Registration received: {{form}}"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="emailBody" className="label">
              Email content <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="emailBody"
              name="emailBody"
              rows={8}
              defaultValue={emailBody ?? ""}
              placeholder={"Hi {{name}},\n\nWe received your registration for {{form}}.\n\nThank you."}
              className="input"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function newQuestion(): FormQuestion {
  return {
    id: newQuestionId(),
    type: "SHORT_TEXT",
    label: "",
    required: true,
  };
}

function newQuestionId(): string {
  return `q${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Copy the complete question tree while giving every copied question a new
 * id. This keeps answers for the original and duplicate completely separate.
 */
function duplicateQuestion(question: FormQuestion): FormQuestion {
  return {
    ...question,
    id: newQuestionId(),
    options: question.options ? [...question.options] : undefined,
    branches: question.branches
      ? Object.fromEntries(
          Object.entries(question.branches).map(([option, questions]) => [
            option,
            questions.map(duplicateQuestion),
          ]),
        )
      : undefined,
  };
}

/**
 * One editable list of questions. Rendered again inside itself for a branch,
 * so a follow-up question has every option the top-level ones have.
 */
function QuestionList({
  questions,
  onChange,
  depth,
}: {
  questions: FormQuestion[];
  onChange: (next: FormQuestion[]) => void;
  depth: number;
}) {
  const patch = (id: string, changes: Partial<FormQuestion>) =>
    onChange(questions.map((q) => (q.id === id ? { ...q, ...changes } : q)));

  const add = () => onChange([...questions, newQuestion()]);

  const duplicate = (index: number) => {
    const copy = duplicateQuestion(questions[index]);
    onChange([
      ...questions.slice(0, index + 1),
      copy,
      ...questions.slice(index + 1),
    ]);
  };

  const remove = (id: string) => onChange(questions.filter((q) => q.id !== id));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {questions.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No questions yet. Add the first one below.
        </p>
      )}

      {questions.map((q, i) => (
        <QuestionRow
          key={q.id}
          question={q}
          index={i}
          total={questions.length}
          depth={depth}
          patch={(changes) => patch(q.id, changes)}
          remove={() => remove(q.id)}
          move={(delta) => move(i, delta)}
          duplicate={() => duplicate(i)}
        />
      ))}

      <button type="button" onClick={add} className="btn-secondary">
        + Add question
      </button>
    </div>
  );
}

function QuestionRow({
  question: q,
  index,
  total,
  depth,
  patch,
  remove,
  move,
  duplicate,
}: {
  question: FormQuestion;
  index: number;
  total: number;
  depth: number;
  patch: (changes: Partial<FormQuestion>) => void;
  remove: () => void;
  move: (delta: number) => void;
  duplicate: () => void;
}) {
  const options = q.options ?? [];
  const branches = q.branches ?? {};
  // A branch hangs off an option's text, so an option still being typed has
  // nothing to hang one off yet. Duplicates would fight over the same branch.
  const namedOptions = options
    .map((o) => o.trim())
    .filter((o, i, all) => o !== "" && all.indexOf(o) === i);
  // Which option's follow-ups are open. Only one at a time: the point of the
  // buttons is to look at one path through the form at a time.
  const [openOption, setOpenOption] = useState<string | null>(null);
  // Kept separately from `branches` so the switch stays on while the first
  // branch is still empty  otherwise it flicks itself back off.
  const [branchOn, setBranchOn] = useState(Object.keys(branches).length > 0);

  const branchable = q.type === "DROPDOWN" && depth < MAX_BRANCH_DEPTH - 1;

  /**
   * Options and branches are edited together on purpose: a branch is keyed by
   * the option text, so renaming one without moving its follow-ups would strand
   * them under an option that no longer exists.
   */
  const setOptions = (
    nextOptions: string[],
    nextBranches: Record<string, FormQuestion[]>,
  ) =>
    patch({
      options: nextOptions,
      branches: Object.keys(nextBranches).length ? nextBranches : undefined,
    });

  const renameOption = (index: number, value: string) => {
    const from = options[index];
    const nextOptions = options.map((o, i) => (i === index ? value : o));
    const nextBranches = { ...branches };
    if (from !== value && nextBranches[from]) {
      nextBranches[value] = nextBranches[from];
      delete nextBranches[from];
    }
    if (openOption === from) setOpenOption(value);
    setOptions(nextOptions, nextBranches);
  };

  const addOption = () => {
    setOptions([...options, ""], branches);
  };

  const removeOption = (index: number) => {
    const gone = options[index];
    const nextBranches = { ...branches };
    delete nextBranches[gone];
    if (openOption === gone) setOpenOption(null);
    setOptions(
      options.filter((_, i) => i !== index),
      nextBranches,
    );
  };

  const setBranch = (option: string, list: FormQuestion[]) => {
    const next = { ...branches };
    if (list.length === 0) delete next[option];
    else next[option] = list;
    patch({ branches: Object.keys(next).length ? next : undefined });
  };

  const toggleBranching = (on: boolean) => {
    setBranchOn(on);
    setOpenOption(on ? (options[0] ?? null) : null);
    // Switching it off throws the follow-ups away: leaving them stored where
    // nothing will ever show them is how a form starts lying about itself.
    if (!on) patch({ branches: undefined });
  };

  if (q.type === "PAGE_BREAK") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-blue-50/40 p-4">
        <span className="text-xs font-bold text-slate-400">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy">Section break</p>
          <input
            value={q.label}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder="Section title (optional), e.g. About you"
            className="input mt-2"
          />
        </div>
        <RowButtons
          index={index}
          total={total}
          move={move}
          remove={remove}
          duplicate={duplicate}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-2">
        <span className="mt-2.5 text-xs font-bold text-slate-400">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <input
            value={q.label}
            readOnly={q.type === "EMAIL"}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder="Question, e.g. Why do you want to join?"
            className="input"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={q.type}
              onChange={(e) => {
                const type = e.target.value as QuestionType;
                // Branches only mean anything on a dropdown; changing type
                // away from one drops them rather than leaving them stored
                // where nothing will ever show them.
                patch({
                  type,
                  label: type === "EMAIL" ? "Email" : q.label,
                  branches: type === "DROPDOWN" ? q.branches : undefined,
                  options: CHOICE_TYPES.includes(type) ? q.options : undefined,
                  maxMb: type === "FILE" ? q.maxMb : undefined,
                });
              }}
              className="input"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            <input
              value={q.helpText ?? ""}
              onChange={(e) => patch({ helpText: e.target.value })}
              placeholder="Helper text (optional)"
              className="input"
            />
          </div>

          {CHOICE_TYPES.includes(q.type) && (
            <div>
              <label className="label">Options</label>
              <div className="space-y-2">
                {options.map((option, oi) => (
                  // Keyed by position: two options can read the same while one
                  // is still being typed.
                  <div key={oi} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-sm text-slate-400">
                      {oi + 1}.
                    </span>
                    <input
                      value={option}
                      onChange={(e) => renameOption(oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="input"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(oi)}
                      aria-label={`Remove option ${oi + 1}`}
                      className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-400 hover:bg-slate-50 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 pl-7 text-sm font-semibold text-primary hover:underline"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary text-xs">
                    +
                  </span>
                  Add option
                </button>
              </div>
            </div>
          )}

          {q.type === "FILE" && (
            <div>
              <label className="label">Max file size (MB)</label>
              <input
                type="number"
                min={1}
                max={MAX_MB_LIMIT}
                value={q.maxMb ?? DEFAULT_MAX_MB}
                onChange={(e) =>
                  patch({ maxMb: Number(e.target.value) || DEFAULT_MAX_MB })
                }
                className="input"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => patch({ required: e.target.checked })}
                  className="h-4 w-4"
                />
                Required
              </label>

              {branchable && (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={branchOn}
                    onChange={(e) => toggleBranching(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Different questions per answer
                </label>
              )}
            </div>

            <RowButtons
              index={index}
              total={total}
              move={move}
              remove={remove}
              duplicate={duplicate}
            />
          </div>

          {branchable && branchOn && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              {namedOptions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Name the options above first  each one gets its own
                  follow-up questions.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    {namedOptions.map((o, oi) => {
                      const count = (branches[o] ?? []).length;
                      const open = openOption === o;
                      return (
                        <button
                          // Option text is not unique while one is being
                          // typed, so the position is what identifies it.
                          key={`${oi}-${o}`}
                          type="button"
                          onClick={() => setOpenOption(open ? null : o)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            open
                              ? "bg-primary text-white"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {o}
                          {count > 0 && ` (${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {openOption !== null && namedOptions.includes(openOption) && (
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <p className="mb-2 text-xs font-semibold text-slate-500">
                        Shown only when the answer is “{openOption}”
                      </p>
                      <QuestionList
                        questions={branches[openOption] ?? []}
                        onChange={(list) => setBranch(openOption, list)}
                        depth={depth + 1}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RowButtons({
  index,
  total,
  move,
  remove,
  duplicate,
}: {
  index: number;
  total: number;
  move: (delta: number) => void;
  remove: () => void;
  duplicate: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={index === 0}
        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        disabled={index === total - 1}
        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={remove}
        className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
      >
        Remove
      </button>
      <button
        type="button"
        onClick={duplicate}
        className="rounded-lg border border-primary/30 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-blue-50"
      >
        Duplicate
      </button>
    </div>
  );
}

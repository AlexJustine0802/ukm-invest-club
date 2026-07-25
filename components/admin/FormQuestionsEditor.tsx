"use client";

import { useState } from "react";
import {
  QUESTION_TYPES,
  CHOICE_TYPES,
  DEFAULT_MAX_MB,
  MAX_MB_LIMIT,
  type FormQuestion,
  type QuestionType,
} from "@/lib/forms";

/**
 * The question builder. Everything is kept in local state and serialised into
 * one hidden input, so the whole form saves through the same plain server
 * action as every other admin page — no per-question endpoints.
 */
export default function FormQuestionsEditor({
  name,
  initial,
}: {
  name: string;
  initial: FormQuestion[];
}) {
  const [questions, setQuestions] = useState<FormQuestion[]>(initial);

  const patch = (id: string, changes: Partial<FormQuestion>) =>
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, ...changes } : q)),
    );

  const add = () =>
    setQuestions((qs) => [
      ...qs,
      {
        id: `q${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        type: "SHORT_TEXT",
        label: "",
        required: true,
      },
    ]);

  const remove = (id: string) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id));

  const move = (index: number, delta: number) =>
    setQuestions((qs) => {
      const target = index + delta;
      if (target < 0 || target >= qs.length) return qs;
      const next = [...qs];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(questions)} />

      {questions.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No questions yet. Add the first one below.
        </p>
      )}

      {questions.map((q, i) => {
        const isChoice = CHOICE_TYPES.includes(q.type);
        return (
          <div key={q.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start gap-2">
              <span className="mt-2.5 text-xs font-bold text-slate-400">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <input
                  value={q.label}
                  onChange={(e) => patch(q.id, { label: e.target.value })}
                  placeholder="Question, e.g. Why do you want to join?"
                  className="input"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={q.type}
                    onChange={(e) =>
                      patch(q.id, { type: e.target.value as QuestionType })
                    }
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
                    onChange={(e) => patch(q.id, { helpText: e.target.value })}
                    placeholder="Helper text (optional)"
                    className="input"
                  />
                </div>

                {isChoice && (
                  <div>
                    <label className="label">Options — one per line</label>
                    <textarea
                      rows={3}
                      value={(q.options ?? []).join("\n")}
                      onChange={(e) =>
                        patch(q.id, {
                          options: e.target.value
                            .split("\n")
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder={"Analyst\nResearch\nMarketing"}
                      className="input"
                    />
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
                        patch(q.id, { maxMb: Number(e.target.value) || DEFAULT_MAX_MB })
                      }
                      className="input"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => patch(q.id, { required: e.target.checked })}
                      className="h-4 w-4"
                    />
                    Required
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === questions.length - 1}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(q.id)}
                      className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button type="button" onClick={add} className="btn-secondary">
        + Add question
      </button>
    </div>
  );
}

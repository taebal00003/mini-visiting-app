"use client";

import { useActionState } from "react";
import { LIMITS } from "@/lib/entry-rules";
import { writeEntryAction, type WriteFormState } from "./actions";
import { FieldError, inputClass, primaryButtonClass } from "./ui";

const initialState: WriteFormState = { status: "idle" };

export function WriteForm() {
  const [state, formAction, pending] = useActionState(writeEntryAction, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form
      // A new key after each success remounts the form, clearing every field.
      key={state.submittedAt ?? "form"}
      action={formAction}
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
      aria-label="새 글 작성"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">이름</span>
          <input
            name="authorName"
            required
            maxLength={LIMITS.authorName.max}
            defaultValue={state.values?.authorName}
            autoComplete="nickname"
            className={inputClass}
            aria-invalid={!!errors.authorName}
          />
          <FieldError message={errors.authorName} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">비밀번호</span>
          <input
            name="password"
            type="password"
            required
            minLength={LIMITS.password.min}
            maxLength={LIMITS.password.max}
            autoComplete="new-password"
            className={inputClass}
            aria-invalid={!!errors.password}
          />
          <FieldError message={errors.password} />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">메시지</span>
        <textarea
          name="message"
          required
          rows={3}
          maxLength={LIMITS.message.max}
          defaultValue={state.values?.message}
          className={inputClass}
          aria-invalid={!!errors.message}
        />
        <FieldError message={errors.message} />
      </label>
      <div className="flex items-center justify-between gap-3">
        <p role="alert" className="text-sm text-danger">
          {state.notice}
        </p>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "등록 중…" : "남기기"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { LIMITS } from "@/lib/entry-rules";
import { writeEntryAction, type WriteFormState } from "./actions";
import { FieldError, inputClass, MessageField, primaryButtonClass } from "./ui";

const initialState: WriteFormState = { status: "idle" };

export function WriteForm() {
  const [state, formAction, pending] = useActionState(writeEntryAction, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form
      // A new key after each success remounts the form, clearing every field.
      key={state.submittedAt ?? "form"}
      action={formAction}
      className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
      aria-label="새 글 작성"
    >
      <h2 className="text-lg font-semibold">새 글 남기기</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">이름</span>
          <input
            name="authorName"
            required
            maxLength={LIMITS.authorName.max}
            defaultValue={state.values?.authorName}
            placeholder={`최대 ${LIMITS.authorName.max}자`}
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
            placeholder={`수정·삭제할 때 필요해요 (${LIMITS.password.min}–${LIMITS.password.max}자)`}
            autoComplete="new-password"
            className={inputClass}
            aria-invalid={!!errors.password}
          />
          <FieldError message={errors.password} />
        </label>
      </div>
      <MessageField
        defaultValue={state.values?.message}
        error={errors.message}
        placeholder="따뜻한 한마디를 남겨 주세요"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="alert" className="text-sm text-danger">
          {state.notice}
        </p>
        <button type="submit" disabled={pending} className={`${primaryButtonClass} ml-auto min-w-24`}>
          {pending ? "등록 중…" : "남기기"}
        </button>
      </div>
    </form>
  );
}

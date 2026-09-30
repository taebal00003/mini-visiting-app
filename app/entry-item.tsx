"use client";

import { useActionState, useState } from "react";
import { LIMITS } from "@/lib/entry-rules";
import { deleteEntryAction, editMessageAction, type ChangeFormState } from "./actions";
import { FieldError, inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";

export type EntryItemData = {
  id: string;
  authorName: string;
  message: string;
  writtenAt: string;
  writtenAtText: string;
  edited: boolean;
};

type Mode = "view" | "edit" | "delete";
type PanelProps = { entry: EntryItemData; onClose: () => void; onGone: (notice: string) => void };

const idle: ChangeFormState = { status: "idle" };

export function EntryItem({ entry, onGone }: { entry: EntryItemData; onGone: (notice: string) => void }) {
  const [mode, setMode] = useState<Mode>("view");
  const close = () => setMode("view");

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-semibold break-all">{entry.authorName}</span>
        <time dateTime={entry.writtenAt} className="text-sm text-muted">
          {entry.writtenAtText}
          {entry.edited && " (수정됨)"}
        </time>
      </div>

      {mode === "edit" ? (
        <EditPanel entry={entry} onClose={close} onGone={onGone} />
      ) : (
        <>
          <p className="mt-2 whitespace-pre-wrap break-words">{entry.message}</p>
          {mode === "delete" ? (
            <DeletePanel entry={entry} onClose={close} onGone={onGone} />
          ) : (
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setMode("edit")} className={secondaryButtonClass}>
                수정
              </button>
              <button type="button" onClick={() => setMode("delete")} className={secondaryButtonClass}>
                삭제
              </button>
            </div>
          )}
        </>
      )}
    </li>
  );
}

function EditPanel({ entry, onClose, onGone }: PanelProps) {
  const [state, formAction, pending] = useActionState(async (prev: ChangeFormState, formData: FormData) => {
    const next = await editMessageAction(entry.id, prev, formData);
    if (next.status === "success") onClose();
    if (next.status === "gone" && next.notice) onGone(next.notice);
    return next;
  }, idle);

  return (
    <form action={formAction} className="mt-3 space-y-2" aria-label={`${entry.authorName}님의 글 수정`}>
      <label className="block">
        <span className="text-sm font-medium">메시지</span>
        <textarea
          name="message"
          required
          rows={3}
          maxLength={LIMITS.message.max}
          defaultValue={state.values?.message ?? entry.message}
          className={inputClass}
          aria-invalid={!!state.fieldErrors?.message}
        />
        <FieldError message={state.fieldErrors?.message} />
      </label>
      <PasswordField />
      <PanelFooter notice={state.notice} pending={pending} submitLabel="수정 저장" onCancel={onClose} />
    </form>
  );
}

function DeletePanel({ entry, onClose, onGone }: PanelProps) {
  const [state, formAction, pending] = useActionState(async (prev: ChangeFormState, formData: FormData) => {
    const next = await deleteEntryAction(entry.id, prev, formData);
    if (next.status === "gone" && next.notice) onGone(next.notice);
    return next;
  }, idle);

  return (
    <form action={formAction} className="mt-3 space-y-2" aria-label={`${entry.authorName}님의 글 삭제`}>
      <p className="text-sm">이 글을 삭제하려면 작성할 때 정한 비밀번호를 입력하세요.</p>
      <PasswordField />
      <PanelFooter notice={state.notice} pending={pending} submitLabel="삭제하기" onCancel={onClose} />
    </form>
  );
}

function PasswordField() {
  return (
    <label className="block">
      <span className="text-sm font-medium">비밀번호</span>
      <input
        name="password"
        type="password"
        required
        maxLength={LIMITS.password.max}
        autoComplete="current-password"
        className={inputClass}
      />
    </label>
  );
}

function PanelFooter({
  notice,
  pending,
  submitLabel,
  onCancel,
}: {
  notice?: string;
  pending: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p role="alert" className="text-sm text-danger">
        {notice}
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} disabled={pending} className={secondaryButtonClass}>
          취소
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "처리 중…" : submitLabel}
        </button>
      </div>
    </div>
  );
}

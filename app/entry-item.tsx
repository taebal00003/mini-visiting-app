"use client";

import { useActionState, useState } from "react";
import { LIMITS } from "@/lib/entry-rules";
import { deleteEntryAction, editMessageAction, type ChangeFormState } from "./actions";
import {
  Avatar,
  dangerButtonClass,
  ghostButtonClass,
  inputClass,
  MessageField,
  primaryButtonClass,
  secondaryButtonClass,
} from "./ui";

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
    <li className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex gap-3">
        <Avatar name={entry.authorName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="block font-semibold break-all">{entry.authorName}</span>
              <time dateTime={entry.writtenAt} className="text-xs text-muted">
                {entry.writtenAtText}
                {entry.edited && " (수정됨)"}
              </time>
            </div>
            {mode === "view" && (
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => setMode("edit")} className={ghostButtonClass}>
                  수정
                </button>
                <button type="button" onClick={() => setMode("delete")} className={ghostButtonClass}>
                  삭제
                </button>
              </div>
            )}
          </div>

          {mode === "edit" ? (
            <EditPanel entry={entry} onClose={close} onGone={onGone} />
          ) : (
            <>
              <p className="mt-2 leading-relaxed whitespace-pre-wrap break-words">{entry.message}</p>
              {mode === "delete" && <DeletePanel entry={entry} onClose={close} onGone={onGone} />}
            </>
          )}
        </div>
      </div>
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
    <form
      action={formAction}
      className="mt-3 space-y-3 rounded-xl bg-accent-soft/60 p-3"
      aria-label={`${entry.authorName}님의 글 수정`}
    >
      <MessageField defaultValue={state.values?.message ?? entry.message} error={state.fieldErrors?.message} />
      <PasswordField />
      <PanelFooter notice={state.notice} pending={pending} onCancel={onClose}>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "처리 중…" : "수정 저장"}
        </button>
      </PanelFooter>
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
    <form
      action={formAction}
      className="mt-3 space-y-3 rounded-xl bg-danger-soft p-3"
      aria-label={`${entry.authorName}님의 글 삭제`}
    >
      <p className="text-sm text-danger">삭제한 글은 되돌릴 수 없어요. 작성할 때 정한 비밀번호를 입력하세요.</p>
      <PasswordField />
      <PanelFooter notice={state.notice} pending={pending} onCancel={onClose}>
        <button type="submit" disabled={pending} className={dangerButtonClass}>
          {pending ? "처리 중…" : "삭제하기"}
        </button>
      </PanelFooter>
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
        placeholder="작성할 때 정한 비밀번호"
        autoComplete="current-password"
        className={inputClass}
      />
    </label>
  );
}

function PanelFooter({
  notice,
  pending,
  onCancel,
  children,
}: {
  notice?: string;
  pending: boolean;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p role="alert" className="text-sm font-medium text-danger">
        {notice}
      </p>
      <div className="ml-auto flex gap-2">
        <button type="button" onClick={onCancel} disabled={pending} className={secondaryButtonClass}>
          취소
        </button>
        {children}
      </div>
    </div>
  );
}

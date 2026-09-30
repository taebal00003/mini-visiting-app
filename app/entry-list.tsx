"use client";

import { useState } from "react";
import { EntryItem, type EntryItemData } from "./entry-item";

export function EntryList({ entries }: { entries: EntryItemData[] }) {
  // List-level notice: survives the refreshed list no longer containing the Entry it is about.
  const [notice, setNotice] = useState<string>();

  return (
    <section className="mt-10" aria-label="방명록 글 목록">
      <h2 className="mb-3 flex items-baseline gap-2 text-lg font-semibold">
        남겨진 글 <span className="text-sm font-normal text-muted">{entries.length}개</span>
      </h2>
      {notice && (
        <p
          role="status"
          className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-danger-soft px-4 py-2.5 text-sm text-danger"
        >
          {notice}
          <button type="button" onClick={() => setNotice(undefined)} className="font-medium underline">
            닫기
          </button>
        </p>
      )}
      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-muted">
          아직 작성된 글이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <EntryItem key={entry.id} entry={entry} onGone={setNotice} />
          ))}
        </ul>
      )}
    </section>
  );
}

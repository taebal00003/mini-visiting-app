"use client";

import { useState } from "react";
import { EntryItem, type EntryItemData } from "./entry-item";

export function EntryList({ entries }: { entries: EntryItemData[] }) {
  // List-level notice: survives the refreshed list no longer containing the Entry it is about.
  const [notice, setNotice] = useState<string>();

  return (
    <section className="mt-8" aria-label="방명록 글 목록">
      {notice && (
        <p role="status" className="mb-3 rounded-lg border border-danger/40 px-3 py-2 text-sm text-danger">
          {notice}
          <button type="button" onClick={() => setNotice(undefined)} className="ml-2 underline">
            닫기
          </button>
        </p>
      )}
      {entries.length === 0 ? (
        <p className="py-10 text-center text-muted">아직 작성된 글이 없습니다.</p>
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

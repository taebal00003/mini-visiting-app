import { randomUUID } from "node:crypto";
import type { EntryStore, StoredEntry } from "./entry-store";

/** In-memory EntryStore for tests. */
export function createMemoryEntryStore(): EntryStore {
  const entries: StoredEntry[] = [];
  let lastWrittenAt = 0;

  // Entries written within the same millisecond still get distinct, increasing times.
  const nextWrittenAt = () => {
    lastWrittenAt = Math.max(Date.now(), lastWrittenAt + 1);
    return new Date(lastWrittenAt);
  };

  return {
    async all() {
      return entries.map((entry) => ({ ...entry }));
    },
    async insert(entry) {
      entries.push({ ...entry, id: randomUUID(), writtenAt: nextWrittenAt(), editedAt: null });
    },
  };
}

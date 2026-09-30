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
    async find(id) {
      const entry = entries.find((e) => e.id === id);
      return entry ? { ...entry } : null;
    },
    async updateMessage(id, message) {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return false;
      entry.message = message;
      entry.editedAt = new Date();
      return true;
    },
    async remove(id) {
      const index = entries.findIndex((e) => e.id === id);
      if (index === -1) return false;
      entries.splice(index, 1);
      return true;
    },
  };
}

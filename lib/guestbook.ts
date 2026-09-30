import type { EntryStore } from "./entry-store";
import { checkFields, type FieldErrors } from "./entry-rules";
import { hashPassword } from "./password";

export type { FieldErrors };

/** What anyone may see of an Entry. Carries nothing about the Entry password. */
export type EntryView = {
  id: string;
  authorName: string;
  message: string;
  writtenAt: Date;
  edited: boolean;
};

export type WriteEntryInput = {
  authorName: string;
  message: string;
  password: string;
};

export type WriteResult = { ok: true } | { ok: false; reason: "invalid"; fieldErrors: FieldErrors };

export type Guestbook = {
  listEntries(): Promise<EntryView[]>;
  writeEntry(input: WriteEntryInput): Promise<WriteResult>;
};

export function createGuestbook(store: EntryStore): Guestbook {
  return {
    async listEntries() {
      const entries = await store.all();
      entries.sort((a, b) => b.writtenAt.getTime() - a.writtenAt.getTime());
      return entries.map((entry) => ({
        id: entry.id,
        authorName: entry.authorName,
        message: entry.message,
        writtenAt: entry.writtenAt,
        edited: entry.editedAt !== null,
      }));
    },

    async writeEntry(input) {
      const checked = checkFields({
        authorName: input.authorName,
        message: input.message,
        password: input.password,
      });
      if (!checked.ok) return { ok: false, reason: "invalid", fieldErrors: checked.fieldErrors };

      const { authorName, message, password } = checked.value;
      await store.insert({ authorName, message, passwordHash: await hashPassword(password) });
      return { ok: true };
    },
  };
}

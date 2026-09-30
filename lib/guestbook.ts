import type { EntryStore } from "./entry-store";
import { checkFields, type FieldErrors } from "./entry-rules";
import { hashPassword, verifyPassword } from "./password";

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

export type EditMessageInput = {
  id: string;
  message: string;
  password: string;
};

export type ChangeResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; fieldErrors: FieldErrors }
  | { ok: false; reason: "wrong-password" }
  | { ok: false; reason: "not-found" };

export type Guestbook = {
  listEntries(): Promise<EntryView[]>;
  writeEntry(input: WriteEntryInput): Promise<WriteResult>;
  /** Changes only the Message, and only for the holder of that Entry's password. */
  editMessage(input: EditMessageInput): Promise<ChangeResult>;
};

const NOT_FOUND = { ok: false, reason: "not-found" } as const;
const WRONG_PASSWORD = { ok: false, reason: "wrong-password" } as const;

export function createGuestbook(store: EntryStore): Guestbook {
  /** The single check guarding every change to an existing Entry. Returns why access is denied, or null. */
  async function authorise(id: string, password: string) {
    const entry = await store.find(id);
    if (!entry) return NOT_FOUND;
    if (!(await verifyPassword(password, entry.passwordHash))) return WRONG_PASSWORD;
    return null;
  }

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

    async editMessage(input) {
      const checked = checkFields({ message: input.message });
      if (!checked.ok) return { ok: false, reason: "invalid", fieldErrors: checked.fieldErrors };

      const denied = await authorise(input.id, input.password);
      if (denied) return denied;

      const updated = await store.updateMessage(input.id, checked.value.message);
      return updated ? { ok: true } : NOT_FOUND;
    },
  };
}

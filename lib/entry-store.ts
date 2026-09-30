/** An Entry as persisted, including the Entry password hash. Never leaves the server. */
export type StoredEntry = {
  id: string;
  authorName: string;
  message: string;
  passwordHash: string;
  writtenAt: Date;
  editedAt: Date | null;
};

export type NewEntry = Pick<StoredEntry, "authorName" | "message" | "passwordHash">;

/** The persistence the Guestbook needs. Holds no rules of its own. */
export interface EntryStore {
  all(): Promise<StoredEntry[]>;
  insert(entry: NewEntry): Promise<void>;
}

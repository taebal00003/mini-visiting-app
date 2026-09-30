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
  find(id: string): Promise<StoredEntry | null>;
  /** Replaces the Message and records when; false if no such Entry. */
  updateMessage(id: string, message: string): Promise<boolean>;
  /** Deletes the Entry for good; false if no such Entry. */
  remove(id: string): Promise<boolean>;
}

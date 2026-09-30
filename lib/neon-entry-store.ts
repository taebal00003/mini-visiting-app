import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { EntryStore, StoredEntry } from "./entry-store";

type EntryRow = {
  id: string;
  author_name: string;
  message: string;
  password_hash: string;
  created_at: string | Date;
  updated_at: string | Date | null;
};

function toStoredEntry(row: EntryRow): StoredEntry {
  return {
    id: row.id,
    authorName: row.author_name,
    message: row.message,
    passwordHash: row.password_hash,
    writtenAt: new Date(row.created_at),
    editedAt: row.updated_at === null ? null : new Date(row.updated_at),
  };
}

/** EntryStore backed by the `entries` table in Neon Postgres. */
export function createNeonEntryStore(databaseUrl: string): EntryStore {
  const sql: NeonQueryFunction<false, false> = neon(databaseUrl);

  return {
    async all() {
      const rows = (await sql`
        SELECT id, author_name, message, password_hash, created_at, updated_at
        FROM entries
        ORDER BY created_at DESC
      `) as EntryRow[];
      return rows.map(toStoredEntry);
    },

    async insert({ authorName, message, passwordHash }) {
      await sql`
        INSERT INTO entries (author_name, message, password_hash)
        VALUES (${authorName}, ${message}, ${passwordHash})
      `;
    },
  };
}

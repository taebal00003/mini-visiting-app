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

// Ids are uuids; anything else cannot name an Entry and would make Postgres throw.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (id: string) => UUID.test(id);

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

    async find(id) {
      if (!isUuid(id)) return null;
      const rows = (await sql`
        SELECT id, author_name, message, password_hash, created_at, updated_at
        FROM entries
        WHERE id = ${id}
      `) as EntryRow[];
      return rows.length > 0 ? toStoredEntry(rows[0]) : null;
    },

    async updateMessage(id, message) {
      if (!isUuid(id)) return false;
      const rows = await sql`
        UPDATE entries SET message = ${message}, updated_at = now()
        WHERE id = ${id}
        RETURNING id
      `;
      return rows.length > 0;
    },

    async remove(id) {
      if (!isUuid(id)) return false;
      const rows = await sql`DELETE FROM entries WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
  };
}

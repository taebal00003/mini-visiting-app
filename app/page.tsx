import { getGuestbook } from "@/lib/app-guestbook";
import { DEVELOPER } from "@/lib/developer";
import { formatWrittenAt } from "@/lib/format";
import { EntryList } from "./entry-list";
import { WriteForm } from "./write-form";

// Every visit shows the latest Entries.
export const dynamic = "force-dynamic";

export default async function Home() {
  const entries = await getGuestbook().listEntries();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">방명록</h1>
        <p className="mt-2 text-sm text-muted">
          개발자: {DEVELOPER.name} ({DEVELOPER.studentId})
        </p>
      </header>

      <WriteForm />

      <EntryList
        entries={entries.map((entry) => ({
          id: entry.id,
          authorName: entry.authorName,
          message: entry.message,
          writtenAt: entry.writtenAt.toISOString(),
          writtenAtText: formatWrittenAt(entry.writtenAt),
          edited: entry.edited,
        }))}
      />
    </main>
  );
}

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
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">방명록</h1>
        <p className="mt-3 text-muted">다녀간 흔적을 한 줄 남겨 주세요.</p>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm">
          <span className="text-muted">개발자:</span>
          <span className="font-medium">
            {DEVELOPER.name} ({DEVELOPER.studentId})
          </span>
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

import { getGuestbook } from "@/lib/app-guestbook";
import { DEVELOPER } from "@/lib/developer";
import { formatWrittenAt } from "@/lib/format";
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

      <section className="mt-8" aria-label="방명록 글 목록">
        {entries.length === 0 ? (
          <p className="py-10 text-center text-muted">아직 작성된 글이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-semibold break-all">{entry.authorName}</span>
                  <time dateTime={entry.writtenAt.toISOString()} className="text-sm text-muted">
                    {formatWrittenAt(entry.writtenAt)}
                    {entry.edited && " (수정됨)"}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words">{entry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

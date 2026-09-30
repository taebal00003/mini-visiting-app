import { DEVELOPER } from "@/lib/developer";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">방명록</h1>
        <p className="mt-2 text-sm text-muted">
          개발자: {DEVELOPER.name} ({DEVELOPER.studentId})
        </p>
      </header>
    </main>
  );
}

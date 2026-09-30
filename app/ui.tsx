export const inputClass =
  "mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus:border-accent aria-invalid:border-danger";

export const primaryButtonClass =
  "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:text-black";

export const secondaryButtonClass =
  "rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-sm text-danger">{message}</span>;
}

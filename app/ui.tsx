"use client";

import { useState } from "react";
import { LIMITS } from "@/lib/entry-rules";

export const inputClass =
  "mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20 aria-invalid:border-danger aria-invalid:ring-danger/20";

const buttonBase =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50";

export const primaryButtonClass = `${buttonBase} bg-accent text-on-accent hover:brightness-110`;
export const dangerButtonClass = `${buttonBase} bg-danger text-on-accent hover:brightness-110`;
export const secondaryButtonClass = `${buttonBase} border border-border bg-surface hover:bg-background`;
export const ghostButtonClass =
  "rounded-md px-2 py-1 text-sm text-muted transition hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-sm text-danger">{message}</span>;
}

/** The Message textarea, with a live character count against the limit. */
export function MessageField({
  defaultValue = "",
  error,
  placeholder,
}: {
  defaultValue?: string;
  error?: string;
  placeholder?: string;
}) {
  const [length, setLength] = useState(defaultValue.length);
  const max = LIMITS.message.max;

  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm font-medium">
        메시지
        <span className={`text-xs tabular-nums ${length > max ? "text-danger" : "text-muted"}`}>
          {length}/{max}
        </span>
      </span>
      <textarea
        name="message"
        required
        rows={3}
        maxLength={max}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(event) => setLength(event.target.value.length)}
        className={`${inputClass} resize-y`}
        aria-invalid={!!error}
      />
      <FieldError message={error} />
    </label>
  );
}

const hueOf = (name: string) => [...name].reduce((hash, ch) => (hash * 31 + ch.codePointAt(0)!) % 360, 7);

/** A round badge with the Author name's first character, coloured by the name. */
export function Avatar({ name }: { name: string }) {
  const hue = hueOf(name);
  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
      style={{ backgroundColor: `hsl(${hue} 55% 55%)` }}
    >
      {[...name][0]}
    </span>
  );
}

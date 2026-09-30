"use server";

import { revalidatePath } from "next/cache";
import { getGuestbook } from "@/lib/app-guestbook";
import type { FieldErrors } from "@/lib/guestbook";

export type WriteFormState = {
  status: "idle" | "success" | "error";
  /** A form-level notice, e.g. an unexpected failure. */
  notice?: string;
  fieldErrors?: FieldErrors;
  /** What the visitor typed, so a rejected form keeps it. The Entry password is never echoed back. */
  values?: { authorName: string; message: string };
  /** Changes on every success so the form can reset itself. */
  submittedAt?: number;
};

const UNEXPECTED = "잠시 후 다시 시도해 주세요.";

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export async function writeEntryAction(_prev: WriteFormState, formData: FormData): Promise<WriteFormState> {
  const input = {
    authorName: text(formData, "authorName"),
    message: text(formData, "message"),
    password: text(formData, "password"),
  };
  const values = { authorName: input.authorName, message: input.message };

  try {
    const result = await getGuestbook().writeEntry(input);
    if (!result.ok) return { status: "error", fieldErrors: result.fieldErrors, values };
  } catch (error) {
    console.error("writeEntry failed", error);
    return { status: "error", notice: UNEXPECTED, values };
  }

  revalidatePath("/");
  return { status: "success", submittedAt: Date.now() };
}

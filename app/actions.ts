"use server";

import { revalidatePath } from "next/cache";
import { getGuestbook } from "@/lib/app-guestbook";
import type { ChangeResult, FieldErrors } from "@/lib/guestbook";

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

export type ChangeFormState = {
  status: "idle" | "success" | "error" | "gone";
  notice?: string;
  fieldErrors?: FieldErrors;
  /** The Message the writer typed, kept when the change is refused. */
  values?: { message: string };
};

const NOTICES = {
  "wrong-password": "비밀번호가 일치하지 않습니다.",
  "not-found": "이미 삭제된 글입니다.",
} as const;

/** Turns a refused or failed change into what the form shows. */
function refusal(result: ChangeResult, values?: ChangeFormState["values"]): ChangeFormState {
  if (result.ok) throw new Error("not a refusal");
  switch (result.reason) {
    case "invalid":
      return { status: "error", fieldErrors: result.fieldErrors, values };
    case "wrong-password":
      return { status: "error", notice: NOTICES["wrong-password"], values };
    case "not-found":
      // Someone else removed it: refresh the list so it disappears here too.
      revalidatePath("/");
      return { status: "gone", notice: NOTICES["not-found"] };
  }
}

export async function editMessageAction(
  id: string,
  _prev: ChangeFormState,
  formData: FormData,
): Promise<ChangeFormState> {
  const input = { id, message: text(formData, "message"), password: text(formData, "password") };
  const values = { message: input.message };

  let result: ChangeResult;
  try {
    result = await getGuestbook().editMessage(input);
  } catch (error) {
    console.error("editMessage failed", error);
    return { status: "error", notice: UNEXPECTED, values };
  }
  if (!result.ok) return refusal(result, values);

  revalidatePath("/");
  return { status: "success" };
}

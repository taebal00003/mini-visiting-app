import { beforeEach, describe, expect, it } from "vitest";
import { createGuestbook, type Guestbook } from "./guestbook";
import { createMemoryEntryStore } from "./memory-entry-store";

let guestbook: Guestbook;

beforeEach(() => {
  guestbook = createGuestbook(createMemoryEntryStore());
});

describe("writeEntry", () => {
  it("shows a written Entry in the list with its Author name and Message", async () => {
    const result = await guestbook.writeEntry({
      authorName: "홍길동",
      message: "안녕하세요",
      password: "1234",
    });

    expect(result).toEqual({ ok: true });
    const entries = await guestbook.listEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      authorName: "홍길동",
      message: "안녕하세요",
      edited: false,
    });
    expect(entries[0].writtenAt).toBeInstanceOf(Date);
  });
});

describe("writeEntry validation", () => {
  const valid = { authorName: "홍길동", message: "안녕하세요", password: "1234" };

  it.each([
    ["an empty Author name", { authorName: "" }, "authorName"],
    ["a blank Author name", { authorName: "   " }, "authorName"],
    ["a 21-character Author name", { authorName: "가".repeat(21) }, "authorName"],
    ["an empty Message", { message: "" }, "message"],
    ["a blank Message", { message: " \n\t " }, "message"],
    ["a 501-character Message", { message: "가".repeat(501) }, "message"],
    ["a 3-character Entry password", { password: "123" }, "password"],
    ["a 33-character Entry password", { password: "a".repeat(33) }, "password"],
  ] as const)("rejects %s without storing anything", async (_, override, field) => {
    const result = await guestbook.writeEntry({ ...valid, ...override });

    expect(result).toMatchObject({ ok: false, reason: "invalid" });
    if (!result.ok && result.reason === "invalid") {
      expect(Object.keys(result.fieldErrors)).toEqual([field]);
      expect(result.fieldErrors[field]).toBeTruthy();
    }
    expect(await guestbook.listEntries()).toEqual([]);
  });

  it.each([
    ["a 1-character Author name", { authorName: "가" }],
    ["a 20-character Author name", { authorName: "가".repeat(20) }],
    ["a 1-character Message", { message: "가" }],
    ["a 500-character Message", { message: "가".repeat(500) }],
    ["a 4-character Entry password", { password: "1234" }],
    ["a 32-character Entry password", { password: "a".repeat(32) }],
  ])("accepts %s", async (_, override) => {
    expect(await guestbook.writeEntry({ ...valid, ...override })).toEqual({ ok: true });
  });

  it("reports every invalid field at once", async () => {
    const result = await guestbook.writeEntry({ authorName: "", message: "", password: "" });

    expect(result).toMatchObject({ ok: false, reason: "invalid" });
    if (!result.ok && result.reason === "invalid") {
      expect(Object.keys(result.fieldErrors).sort()).toEqual(["authorName", "message", "password"]);
    }
  });

  it("trims surrounding whitespace from the Author name and Message", async () => {
    await guestbook.writeEntry({ authorName: "  홍길동 ", message: "\n 안녕\n하세요  \n", password: "1234" });

    const [entry] = await guestbook.listEntries();
    expect(entry.authorName).toBe("홍길동");
    expect(entry.message).toBe("안녕\n하세요");
  });

  it("measures length after trimming", async () => {
    const result = await guestbook.writeEntry({ ...valid, authorName: `  ${"가".repeat(20)}  ` });
    expect(result).toEqual({ ok: true });
  });
});

describe("Entry password protection", () => {
  it("exposes only public fields in the list", async () => {
    await guestbook.writeEntry({ authorName: "홍길동", message: "안녕하세요", password: "1234" });

    const [entry] = await guestbook.listEntries();
    expect(Object.keys(entry).sort()).toEqual(["authorName", "edited", "id", "message", "writtenAt"]);
  });

  it("never stores the Entry password as typed, and salts each Entry separately", async () => {
    // The store is this test's own collaborator: we check what the Guestbook hands it.
    const store = createMemoryEntryStore();
    const book = createGuestbook(store);
    await book.writeEntry({ authorName: "가", message: "하나", password: "same-password" });
    await book.writeEntry({ authorName: "나", message: "둘", password: "same-password" });

    const hashes = (await store.all()).map((entry) => entry.passwordHash);
    expect(hashes.every((hash) => !hash.includes("same-password"))).toBe(true);
    expect(hashes[0]).not.toBe(hashes[1]);
  });
});

/** Writes an Entry and returns its id. */
async function write(authorName: string, message: string, password: string) {
  const result = await guestbook.writeEntry({ authorName, message, password });
  expect(result).toEqual({ ok: true });
  const entry = (await guestbook.listEntries()).find((e) => e.message === message);
  return entry!.id;
}

const messageOf = async (id: string) => (await guestbook.listEntries()).find((e) => e.id === id);

describe("editMessage", () => {
  it("changes the Message and marks the Entry Edited when the Entry password matches", async () => {
    const id = await write("홍길동", "처음 메시지", "secret");

    const result = await guestbook.editMessage({ id, message: "고친 메시지", password: "secret" });

    expect(result).toEqual({ ok: true });
    expect(await messageOf(id)).toMatchObject({ message: "고친 메시지", edited: true, authorName: "홍길동" });
  });

  it("refuses a wrong Entry password and leaves the Entry unchanged", async () => {
    const id = await write("홍길동", "처음 메시지", "secret");

    const result = await guestbook.editMessage({ id, message: "몰래 고침", password: "not-secret" });

    expect(result).toEqual({ ok: false, reason: "wrong-password" });
    expect(await messageOf(id)).toMatchObject({ message: "처음 메시지", edited: false });
  });

  it("refuses another Entry's password", async () => {
    const mine = await write("나", "내 글", "mine-pass");
    await write("너", "네 글", "your-pass");

    const result = await guestbook.editMessage({ id: mine, message: "고침", password: "your-pass" });

    expect(result).toEqual({ ok: false, reason: "wrong-password" });
    expect(await messageOf(mine)).toMatchObject({ message: "내 글", edited: false });
  });

  it("keeps the Entry's place in the list", async () => {
    const older = await write("가", "오래된 글", "1234");
    await write("나", "새 글", "1234");

    await guestbook.editMessage({ id: older, message: "오래된 글 (고침)", password: "1234" });

    const messages = (await guestbook.listEntries()).map((e) => e.message);
    expect(messages).toEqual(["새 글", "오래된 글 (고침)"]);
  });

  it("reports an Entry that no longer exists", async () => {
    const result = await guestbook.editMessage({ id: "no-such-entry", message: "고침", password: "1234" });
    expect(result).toEqual({ ok: false, reason: "not-found" });
  });

  it.each([
    ["an empty Message", ""],
    ["a blank Message", "   "],
    ["a 501-character Message", "가".repeat(501)],
  ])("rejects %s even with the right Entry password", async (_, message) => {
    const id = await write("홍길동", "처음 메시지", "secret");

    const result = await guestbook.editMessage({ id, message, password: "secret" });

    expect(result).toMatchObject({ ok: false, reason: "invalid", fieldErrors: { message: expect.any(String) } });
    expect(await messageOf(id)).toMatchObject({ message: "처음 메시지", edited: false });
  });

  it("trims the new Message", async () => {
    const id = await write("홍길동", "처음 메시지", "secret");
    await guestbook.editMessage({ id, message: "  고친 메시지 \n", password: "secret" });
    expect((await messageOf(id))?.message).toBe("고친 메시지");
  });
});

describe("deleteEntry", () => {
  it("removes the Entry when the Entry password matches, leaving the others", async () => {
    const mine = await write("나", "지울 글", "mine-pass");
    const yours = await write("너", "남을 글", "your-pass");

    const result = await guestbook.deleteEntry({ id: mine, password: "mine-pass" });

    expect(result).toEqual({ ok: true });
    const ids = (await guestbook.listEntries()).map((e) => e.id);
    expect(ids).toEqual([yours]);
  });

  it("refuses a wrong Entry password and keeps the Entry", async () => {
    const id = await write("나", "지키는 글", "mine-pass");

    const result = await guestbook.deleteEntry({ id, password: "guess" });

    expect(result).toEqual({ ok: false, reason: "wrong-password" });
    expect(await messageOf(id)).toMatchObject({ message: "지키는 글" });
  });

  it("refuses another Entry's password", async () => {
    const mine = await write("나", "내 글", "mine-pass");
    await write("너", "네 글", "your-pass");

    const result = await guestbook.deleteEntry({ id: mine, password: "your-pass" });

    expect(result).toEqual({ ok: false, reason: "wrong-password" });
    expect(await messageOf(mine)).toBeDefined();
  });

  it("reports an Entry that does not exist", async () => {
    expect(await guestbook.deleteEntry({ id: "no-such-entry", password: "1234" })).toEqual({
      ok: false,
      reason: "not-found",
    });
  });

  it("reports an Entry that was already deleted", async () => {
    const id = await write("나", "두 번 지울 글", "mine-pass");
    await guestbook.deleteEntry({ id, password: "mine-pass" });

    expect(await guestbook.deleteEntry({ id, password: "mine-pass" })).toEqual({ ok: false, reason: "not-found" });
  });

  it("cannot edit an Entry once it is deleted", async () => {
    const id = await write("나", "지운 뒤 고칠 글", "mine-pass");
    await guestbook.deleteEntry({ id, password: "mine-pass" });

    expect(await guestbook.editMessage({ id, message: "고침", password: "mine-pass" })).toEqual({
      ok: false,
      reason: "not-found",
    });
  });
});

describe("listEntries", () => {
  it("lists Entries newest first", async () => {
    for (const authorName of ["첫째", "둘째", "셋째"]) {
      await guestbook.writeEntry({ authorName, message: "메시지", password: "1234" });
    }

    const names = (await guestbook.listEntries()).map((entry) => entry.authorName);
    expect(names).toEqual(["셋째", "둘째", "첫째"]);
  });

  it("is empty before anything is written", async () => {
    expect(await guestbook.listEntries()).toEqual([]);
  });
});

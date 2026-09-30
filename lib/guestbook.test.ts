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

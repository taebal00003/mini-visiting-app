import { createGuestbook, type Guestbook } from "./guestbook";
import { createNeonEntryStore } from "./neon-entry-store";

let guestbook: Guestbook | undefined;

/** The app's Guestbook, backed by Neon. Server-only: reads DATABASE_URL. */
export function getGuestbook(): Guestbook {
  if (!guestbook) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    guestbook = createGuestbook(createNeonEntryStore(url));
  }
  return guestbook;
}

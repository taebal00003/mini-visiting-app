# Guestbook

A single public page where anyone can leave a short signed note, and only the person who wrote a note can change or remove it. There are no accounts; ownership is proven per note.

## Language

**Entry**:
One note on the guestbook, made of an Author name, a Message, an Entry password and the moment it was written.
_Avoid_: Post, comment, article, 게시물

**Author name**:
The display label the writer types onto an Entry. It is not an identity: two Entries with the same Author name share nothing.
_Avoid_: User, username, account, nickname

**Message**:
The body text of an Entry, and the only part of an Entry that can be changed after writing.
_Avoid_: Content, body, text

**Entry password**:
The secret chosen when an Entry is written, which alone proves the right to edit or delete that one Entry.
_Avoid_: User password, PIN, key

**Written at**:
The moment an Entry was first written. It fixes the Entry's place in the list and never changes when the Message is edited.
_Avoid_: Updated at, timestamp, date

**Edited**:
The state of an Entry whose Message has been changed at least once since it was written.
_Avoid_: Modified, updated

**Developer**:
The student who built and submitted this guestbook, named on the page (권태현, 202204175).
_Avoid_: Admin, owner, author

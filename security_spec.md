# Security Specification for MS AI

## Data Invariants
1. A **Chat** must belong to a valid user. `userId` must match the authenticated user.
2. A **Message** must belong to an existing **Chat**. The user must be the owner of the parent chat.
3. **User** profiles should only be writable by the user themselves. PII (email) should only be readable by the owner.
4. Terminal states (none identified yet, but `updatedAt` and `createdAt` must be server-validated).

## The Dirty Dozen Payloads (Rejection Targets)

1. **Identity Spoofing (User)**: Create a user document for a different UID.
2. **Identity Spoofing (Chat)**: Create a chat with a `userId` that isn't yours.
3. **Ghost Fields**: Add an `isAdmin: true` field to a user profile.
4. **Orphaned Message**: Create a message in a chat ID that doesn't exist.
5. **Cross-User Leak**: Read messages from a chat ID belonging to someone else.
6. **Chat Hijack**: Update the `userId` of a chat to take ownership of someone else's conversation.
7. **Timestamp Fraud**: Set `createdAt` to a date in the past.
8. **Malicious ID**: Use a 2KB string as a `chatId` to cause resource exhaustion.
9. **Bulk Scraping**: Attempt to list all chats in the system without filtering by `userId`.
10. **Shadow Update**: Attempt to update an immutable field like `userId` on a chat.
11. **Type Poisoning**: Set `role` in a message to "admin" or "superuser" (not in enum).
12. **Unverified Access**: Attempt to write data as a user with an unverified email.

## Rule Evolution Plan
1. Use `isValidId` for all path variables.
2. Use `isValid[Entity]` helpers for all writes.
3. Use `Master Gate` to ensure message logic depends on chat ownership.
4. Strict `affectedKeys().hasOnly()` gates for updates.

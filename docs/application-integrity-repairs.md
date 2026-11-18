# Application and account repairs

This change addresses findings **1, 5, 6, and 7**, plus sign-up image optimization, from the application review. The implementation was developed from `origin/main` at `a5afb05`.

Findings 2 (split submission commits), 3 (failed application reads treated as missing drafts), and 4 (application form reset after saving) are outside this patch. This patch does not claim those problems are resolved. It also excludes the broader dependency upgrade, upload-content hardening, and multi-instance résumé-link redesign from the full report.

## 1. Old requests could overwrite submitted applications

### What went wrong

The save endpoint checked the user's status before writing. That check could be true when a request started and false when it finished. The actual upsert had no state or version condition. An old Save draft request could therefore finish after Submit, replacing the submitted answers and changing the application back to `draft`. An older tab could also overwrite a newer draft. Track changes had the same problem and could clear newly submitted Normal answers.

### What changed

Every application save, submit, and track change takes the same PostgreSQL lock on the existing user row before reading and changing the application. Locking the user also covers the first save, when no application row exists yet. Membership changes use the same user-before-team lock order where they affect the application's team flag.

Applications now carry a monotonically increasing `revision`. The form sends the revision it last loaded or successfully saved. Under the lock, the server verifies both the current application state and that revision. A stale or missing revision produces HTTP 409 instead of overwriting answers. The form shows the conflict and leaves the current text available to copy. Submission rejects later draft and track writes even if those requests passed an earlier route-level check.

The form also prevents overlapping Save, Next, and Submit actions. This is a convenience; the database checks protect separate tabs and concurrent server instances.

```text
Old:  check draft → another request submits → unconditional draft write
New:  lock user → read current state and revision → reject stale write or commit
```

The existing two-stage submission status flow is retained: the application commits first, then the user's status changes separately. The second stage never rewrites application answers. A retry of a partially completed submission uses the already committed answers rather than replacing them. A failure between these stages remains possible under deferred finding 2.

## 5. Replacing a résumé deleted the file still referenced by a saved draft

### What went wrong

Uploading a replacement immediately deleted the previous pending object. Updating the draft's database reference happened later through a separate Save or Submit request. Closing the browser, losing the response, or failing the next save could leave the saved draft pointing at a file that no longer existed.

### What changed

Uploading a new résumé retains the previous object. Removing an attachment from the form also retains the stored object; the interface explains that saving the application makes the reference change durable. Submission retains the pending source after copying it to the finalized location.

This deliberately favors recoverable files over immediate space reclamation. The patch does not introduce a cleanup job. A future cleanup must check durable application references and use a grace period before deleting anything. A blanket age-based expiry of `pending/` objects is unsafe while saved drafts can reference those keys. Actual S3 lifecycle/versioning settings were not inspected or changed.

## 6. Team answers had concurrent-write and deletion risks

### What went wrong

Shared essays and individual Mars answers used unconditional writes. Two tabs could save different versions, with the last request silently winning. Membership or answer-lock checks happened separately from the write, so removing/rejoining a team or locking answers during a pending request could invalidate the earlier check. Refreshing team data could also overwrite locally edited answers. Removing members or deleting a team erased the only stored copy of their answers.

### What changed

- Shared essays have `essayRevision`; each member's Mars answer has `marsRevision`. Saves require the corresponding expected revision.
- Each membership has a unique `membershipId`. Leaving and rejoining creates a new identity, so requests from the old membership cannot edit the new one.
- Answer writes lock the team, then recheck membership, revision, and answer-lock state. Ownership transfer and membership removal serialize against the same team state.
- The editor tracks separate acknowledged values and revisions for Mars and essay. Saving one does not mark unsaved edits to the other as saved. Server refreshes preserve local changes; a conflicting save leaves the text and shows an error.
- Team submission and the Back button are blocked while team answers are dirty or saving, preventing submission of an older answer or loss when the answer editor unmounts.
- Submission records an immutable `teamSnapshot` containing the team, members, answers, and revisions observed under the team lock. The review screen distinguishes answers at submission from current team answers.
- PostgreSQL triggers preserve a baseline and every subsequent team/member insert, update, and deletion in `teamAnswerHistory`. History has no cascading team/member foreign key, so deleting those records does not delete the retained evidence.

Team editing remains governed by the existing registration phase and lock controls. The submission snapshot is a receipt, not an automatic final evaluation export at the registration deadline. History starts with the state present when migration 0009 runs; it cannot reconstruct text deleted before that migration. These records contain applicant information and must remain restricted to authorized database operators.

## 7. Authentication lacked request, revocation, and guessing controls

### What went wrong

The custom login route accepted cross-site requests without the protections provided by the standard Auth.js flow. JWT sessions retained old claims when a user disappeared, and password resets did not revoke previously issued sessions. Verification codes used non-cryptographic randomness and had no atomic attempt limit. Password-reset tokens could be consumed concurrently. Process-local checks would not reliably limit requests across server instances.

### What changed

**Request origin:** Custom authentication endpoints require JSON and an exact configured origin, and reject cross-site requests. Authentication bodies are capped at 16 KiB. The forms send the required JSON content type. The origin comes from deployment configuration, not an attacker-controlled request host.

**Session revocation:** Users have a `sessionVersion`. JWTs record the version at authentication and must match the current user on each session refresh. Missing users, missing versions, and mismatched versions fail closed. Password reset increments the version in the same transaction as the password update. Fresh login also checks the version used to verify the password, closing the race where a reset happens during login. The bulk password-reset script increments it too. Existing JWTs without a version require users to sign in again after deployment.

**Password reset:** Reset consumption locks the user and claims an unexpired token in one transaction, updates the password and session version, and removes sibling reset tokens. Concurrent use of the same token, or different tokens for the same account, has only one winner.

**Verification codes:** Codes use Node's cryptographic random generator. An atomic counter allows at most five attempts per code. An email-level guessing budget survives resends. Token issuance is serialized, has a cooldown and issuance budget, and successful verification consumes the token once. Email delivery happens after registration commits, rather than holding the transaction open during SES work.

**Shared limits:** PostgreSQL stores fixed-window budgets, shared by all server instances. Password attempts are limited by trusted client IP and by IP plus account, avoiding an email-only password lockout that another person could deliberately exhaust. The credentials provider and custom login use the same password-checking helper. Cleanup locks only expired, currently unlocked buckets so simultaneous resets neither deadlock nor erase a freshly renewed budget. Errors such as 429 and temporary unavailability are displayed by the forms.

On Vercel, the implementation uses its overwritten `x-forwarded-for`. Other hosting setups must configure `AUTH_TRUSTED_IP_HEADER` to a header their trusted ingress **overwrites**, and must prevent clients from bypassing that ingress. Production authentication fails closed when that trusted IP is missing or invalid. Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the actual HTTPS portal origin. The example file was normalized to UTF-8 and uses port 3001 locally.

These are the application-level fixes in finding 7. This scoped patch does not upgrade framework dependencies or claim to resolve every advisory reported by a package audit.

## Image optimization

The 5,304,530-byte sign-up beach PNG was converted to a 3,312,808-byte lossless WebP: **37.5% smaller**. Decoding both files to raw RGBA produced identical pixels. The decorative auth scene now mounts only at desktop widths, so hiding it on mobile no longer leaves an eagerly requested image behind. Its priority preload was removed. Existing artwork was preserved.

## Validation

The regression suite runs actual query helpers against temporary PostgreSQL with synthetic records, applies migration 0009 to the preceding schema shape, and exercises genuine competing database connections. UI tests use the real form/action components with mocked network responses; authentication route tests isolate mail and login side effects. No test loads local production credentials or connects to the deployed database, S3, or SES.

Covered cases include late draft/track writes, concurrent first saves, stale revisions, team lock and membership races, preservation of history and snapshots after deletion, independent team answer baselines, blocked unsaved-team submission/navigation, résumé replacement retention, session revocation, reset-token races, code attempt limits, concurrent code issuance, shared-budget contention, cross-site login rejection, and recoverable auth errors.

Validation on October 17, 2026: **35 tests passed across five suites**, TypeScript passed, lint passed with three warnings in unchanged files, and the production build passed with lint and type checking enabled. Migration metadata has no unexplained schema changes. The build used dummy service credentials and an unreachable local database; event-configuration reads used the existing fallback, so this is compilation evidence rather than an integration test against live services.

Run using Node 22.12 or newer for the test tooling:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

If the package manager blocks native package installation scripts, allow the relevant `@embedded-postgres/<platform>` package's binary hydration script before running the database tests. PostgreSQL runs on loopback in a temporary directory and is stopped and removed after the tests. A successful local build does not establish deployed browser behavior, live mail delivery, or production recovery readiness.

## Deployment and rollback

1. Rehearse migration `0009_application-integrity.sql` against a disposable copy of the actual deployed schema. Verify current migration metadata, a recent backup, and a working restore procedure. The test harness uses a reconstructed pre-change schema; it is not a production restore rehearsal.
2. Verify the canonical origins and trusted client IP behavior at the real ingress. Keep preview deployments isolated from the production database and mail/storage settings.
3. Quiesce application/team/auth writes while applying the migration and switching to the new server revision. Old servers do not enforce the new revision checks; a mixed deployment would undermine the protection. Existing browser tabs need a reload and existing sessions need a fresh sign-in.
4. Apply the additive migration through the repository's migration runner, then deploy the matching code. It adds revision, history, snapshot, verification-attempt, session-version, and rate-limit storage. It does not delete applications, answers, or files.
5. Smoke-test normal and Google sign-in, verification, password reset, all three application tracks, two-tab conflicts, team locks/removal/rejoining, résumé replacement followed by reload, and the submission receipt using test accounts. Verify existing pending résumé objects remain accessible.
6. Leave the additive columns/history in place during an emergency code rollback. An old server can run with the extra schema, but it reintroduces the old write and session behavior; keep affected writes paused until a corrected deployment is ready. Do not drop the new history to roll back code.

Migration, production deployment, real-provider smoke tests, backup/restore checks, and bucket lifecycle verification were not performed by this repair task. Findings 2–4 and the excluded dependency advisories remain separate work.

import assert from "node:assert/strict";

import { REQUEST_COOLDOWN_MS, TRACK_SECTIONS } from "../../config/apply";
import { safeCallbackUrl } from "./callback";
import { requestBlockReason } from "./requests";
import { cardHeadline, cardQuery, parseCardOptions } from "./team-card";
import { TRAVEL_CAP_MESSAGE, travelAmountError } from "./travel";
import { isHttpUrl, isSocialUrl } from "./urls";
import { wordCount } from "./words";

assert.equal(wordCount("  one   two three "), 3);
assert.equal(wordCount(""), 0);
assert.equal(wordCount("   "), 0);
assert.equal(travelAmountError(""), null);
assert.equal(travelAmountError("200"), null);
assert.equal(travelAmountError("201"), TRAVEL_CAP_MESSAGE);
assert.equal(travelAmountError("nope"), "Enter a whole dollar amount.");

assert.equal(safeCallbackUrl("/apply"), "/apply");
assert.equal(safeCallbackUrl("/apply/normal?x=1"), "/apply/normal?x=1");
assert.equal(safeCallbackUrl("/profile"), "/profile");
assert.equal(safeCallbackUrl("/"), "/apply");
assert.equal(safeCallbackUrl("//evil.com"), "/apply");
assert.equal(safeCallbackUrl("https://evil.com"), "/apply");
assert.equal(safeCallbackUrl("/sign-in"), "/apply");
assert.equal(safeCallbackUrl("/email-verification/new-code"), "/apply");
assert.equal(safeCallbackUrl(null), "/apply");

assert.equal(isSocialUrl("github.com/hackcanada", ["github.com"]), true);
assert.equal(isSocialUrl("https://evil.com/hackcanada", ["github.com"]), false);
assert.equal(
  isSocialUrl("https://www.linkedin.com/in/ada?trk=1", ["linkedin.com"]),
  true,
);
assert.equal(isHttpUrl("mysite.dev/work"), true);
assert.equal(isHttpUrl("not a url"), false);

assert.deepEqual(TRACK_SECTIONS.quick, ["basic", "socials"]);
assert.deepEqual(TRACK_SECTIONS.normal, ["basic", "socials", "normal"]);
assert.deepEqual(TRACK_SECTIONS.team, ["basic", "socials", "team"]);

const now = Date.UTC(2026, 9, 11);
assert.equal(
  requestBlockReason({
    pendingCount: 1,
    alreadyPendingHere: true,
    declinedAt: null,
    now,
  }),
  "You already asked to join this team.",
);
assert.match(
  requestBlockReason({
    pendingCount: 5,
    alreadyPendingHere: false,
    declinedAt: null,
    now,
  }) ?? "",
  /5 open requests/,
);
assert.equal(
  requestBlockReason({
    pendingCount: 4,
    alreadyPendingHere: false,
    declinedAt: null,
    now,
  }),
  null,
);
assert.match(
  requestBlockReason({
    pendingCount: 0,
    alreadyPendingHere: false,
    declinedAt: now - REQUEST_COOLDOWN_MS + 1000,
    now,
  }) ?? "",
  /24 hours/,
);
assert.equal(
  requestBlockReason({
    pendingCount: 0,
    alreadyPendingHere: false,
    declinedAt: now - REQUEST_COOLDOWN_MS - 1,
    now,
  }),
  null,
);

assert.deepEqual(parseCardOptions({}), {
  cta: "looking",
  looking: false,
  size: "square",
});
assert.deepEqual(
  parseCardOptions({ cta: ["join", "x"], looking: "1", size: "wide" }),
  { cta: "join", looking: true, size: "wide" },
);
assert.equal(parseCardOptions({ cta: "<script>" }).cta, "looking");
assert.equal(cardHeadline("spots", 1), "1 spot open");
assert.equal(cardHeadline("spots", 0), "Our team is full");
assert.equal(
  cardQuery({ cta: "join", looking: true, size: "wide" }).toString(),
  "cta=join&looking=1&size=wide",
);

console.log("apply checks passed");

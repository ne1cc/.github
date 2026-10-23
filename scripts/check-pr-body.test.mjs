import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkPrBody } from "./check-pr-body.mjs";

const template = readFileSync(new URL("../pull_request_template.md", import.meta.url), "utf8");

const filled = `Closes #23

## Summary
Adds a phase filter to the trials endpoint.

## Approach
Reused the pagination pattern from sites.py.

## Changes
- \`api/routes/trials.py\`: parse \`phase\` query param.

## Deviations from the issue
None

## Verification
\`\`\`
pytest tests/api/test_trials.py  # 12 passed
\`\`\`

## Limits & notes for reviewers
None
`;

test("filled body passes", () => {
  assert.deepEqual(checkPrBody(filled, []), []);
});

test("untouched template fails on issue link and every section", () => {
  const problems = checkPrBody(template, []);
  assert.ok(problems.some((p) => p.includes("Closes #N")));
  assert.equal(problems.filter((p) => p.startsWith("Empty section")).length, 6);
});

test("missing section is reported by name", () => {
  const body = filled.replace(/## Verification[\s\S]*?(?=## Limits)/, "");
  assert.deepEqual(checkPrBody(body, []), ["Missing section: ## Verification"]);
});

test("comment-only section counts as empty", () => {
  const body = filled.replace("None\n\n## Verification", "<!-- say None -->\n\n## Verification");
  assert.deepEqual(checkPrBody(body, []), ["Empty section: ## Deviations from the issue"]);
});

test("Fixes/Resolves also link the issue", () => {
  assert.deepEqual(checkPrBody(filled.replace("Closes #23", "Fixes #23"), []), []);
  assert.deepEqual(checkPrBody(filled.replace("Closes #23", "resolves #23"), []), []);
});

test("missing issue link fails unless labelled no-issue", () => {
  const body = filled.replace("Closes #23\n", "");
  assert.equal(checkPrBody(body, []).length, 1);
  assert.deepEqual(checkPrBody(body, ["no-issue"]), []);
});

test("empty body fails", () => {
  assert.ok(checkPrBody("", []).length > 0);
  assert.ok(checkPrBody(null, []).length > 0);
});

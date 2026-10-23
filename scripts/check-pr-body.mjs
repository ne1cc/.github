/**
 * Checks that a PR body follows pull_request_template.md.
 *
 * Contract:
 * - Returns [] when the body links an issue and every required section has content.
 * - Returns one human-readable problem string per violation otherwise.
 *
 * Limits: sections are matched by exact "## <name>" headings; HTML comments
 * (the template's placeholders) and lines starting with 🤖 (agent attribution
 * footers, which land inside the last section) don't count as content.
 */
export const REQUIRED_SECTIONS = [
  "Summary",
  "Approach",
  "Changes",
  "Deviations from the issue",
  "Verification",
  "Limits & notes for reviewers",
];

const ISSUE_LINK = /\b(close[sd]?|fix(e[sd])?|resolve[sd]?)\s+#\d+/i;

export function checkPrBody(body, labels = []) {
  const text = (body ?? "").replace(/<!--[\s\S]*?-->/g, "").replace(/^🤖.*$/gm, "");
  const problems = [];

  // 1. Issue link required (label "no-issue" → exempt, for PRs not driven by an issue)
  if (!labels.includes("no-issue") && !ISSUE_LINK.test(text)) {
    problems.push('Missing issue link: add "Closes #N" (or label the PR "no-issue")');
  }

  // 2. Each section must exist and hold something other than whitespace
  const sections = {};
  for (const part of text.split(/^## +/m).slice(1)) {
    const nl = part.indexOf("\n");
    const name = (nl === -1 ? part : part.slice(0, nl)).trim();
    sections[name] = nl === -1 ? "" : part.slice(nl + 1).trim();
  }
  for (const name of REQUIRED_SECTIONS) {
    if (!(name in sections)) problems.push(`Missing section: ## ${name}`);
    else if (!sections[name]) problems.push(`Empty section: ## ${name}`);
  }
  return problems;
}

// CLI entry for the reusable workflow: PR_BODY / PR_LABELS (comma-separated) from env.
if (import.meta.url === `file://${process.argv[1]}`) {
  const labels = (process.env.PR_LABELS ?? "").split(",").filter(Boolean);
  const problems = checkPrBody(process.env.PR_BODY, labels);
  for (const p of problems) console.log(`::error::${p}`);
  if (problems.length) {
    console.log("Fill in pull_request_template.md: https://github.com/ne1cc/.github/blob/main/pull_request_template.md");
    process.exit(1);
  }
  console.log("PR body follows the template.");
}

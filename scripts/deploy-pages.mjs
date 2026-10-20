import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

// Use a separate Git index: the source checkout, branch and staged files stay intact.
const project = process.cwd();
const dist = resolve(project, "dist");
const temporary = mkdtempSync(join(tmpdir(), "cyber-pages-"));
const git = (args, extra = {}) =>
  execFileSync("git", args, {
    cwd: project,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    ...extra,
  }).trim();
try {
  if (!existsSync(join(dist, "index.html")))
    throw new Error("Avval npm run build buyrug‘ini bajaring.");
  let parent;
  try {
    git(["ls-remote", "--exit-code", "origin", "refs/heads/gh-pages"]);
    git(["fetch", "origin", "refs/heads/gh-pages"]);
    parent = git(["rev-parse", "FETCH_HEAD"]);
  } catch (error) {
    if (error.status !== 2) throw error;
  }
  writeFileSync(join(dist, ".nojekyll"), "");
  const env = {
    ...process.env,
    GIT_DIR: git(["rev-parse", "--absolute-git-dir"]),
    GIT_WORK_TREE: dist,
    GIT_INDEX_FILE: join(temporary, "index"),
  };
  git(["read-tree", "--empty"], { env });
  git(["add", "--all", "--force"], { env });
  const tree = git(["write-tree"], { env });
  if (parent && git(["rev-parse", `${parent}^{tree}`]) === tree) {
    console.log("gh-pages tarmog‘idagi sayt allaqachon shu nusxada.");
  } else {
    const source = git(["rev-parse", "HEAD"]);
    const commit = git(
      ["commit-tree", tree, ...(parent ? ["-p", parent] : [])],
      {
        input: `Deploy Cyber University to GitHub Pages\n\nSource: ${source}\n`,
      },
    );
    if (process.argv.includes("--dry-run")) {
      console.log(`Sinov: sayt tayyor (${commit}); GitHub’ga yuborilmadi.`);
    } else {
      git(["push", "origin", `${commit}:refs/heads/gh-pages`]);
      console.log(`Sayt gh-pages tarmog‘iga joylashtirildi: ${commit}`);
    }
  }
} catch (error) {
  const message = error.stderr?.toString() || error.message;
  console.error(message.replace(/(https?:\/\/)[^/\s@]+@/g, "$1[redacted]@"));
  process.exitCode = 1;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

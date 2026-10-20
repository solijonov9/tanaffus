import { execFileSync } from "node:child_process";

// GitHub's existing Pages configuration publishes this source branch's root.
const branch = "codex/cyber-university-seminar";
const generated = ["index.html", "portable/cyber-university.html"];
const git = (args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
try {
  if (git(["branch", "--show-current"]) !== branch)
    throw new Error(`Nashr uchun ${branch} tarmog‘iga o‘ting.`);
  const changes = [
    ...git(["diff", "--name-only", "HEAD", "-z"]).split("\0"),
    ...git(["ls-files", "--others", "--exclude-standard", "-z"]).split("\0"),
  ].filter(Boolean);
  const sourceChanges = changes.filter((file) => !generated.includes(file));
  if (sourceChanges.length)
    throw new Error(
      "Avval manba o‘zgarishlarini commit qiling: " + sourceChanges.join(", "),
    );
  if (changes.length) {
    git(["add", "--", ...generated]);
    git([
      "commit",
      "--only",
      "-m",
      "Refresh compiled GitHub Pages entry",
      "--",
      ...generated,
    ]);
  }
  git(["push", "origin", `HEAD:refs/heads/${branch}`]);
  console.log(
    "GitHub Pages manba tarmog‘i yangilandi. GitHub nashr jarayonini avtomatik boshlaydi.",
  );
} catch (error) {
  const message = error.stderr?.toString() || error.message;
  console.error(message.replace(/(https?:\/\/)[^/\s@]+@/g, "$1[redacted]@"));
  process.exitCode = 1;
}

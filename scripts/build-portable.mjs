import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, extname } from "node:path";

// Bundle the already built site into a file that also opens through file://.
const root = resolve("dist");
const readAsset = (path) =>
  readFileSync(resolve(root, path.replace(/^\//, "")));
const dataUrl = (path) => {
  const mime = {
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
    ".png": "image/png",
  }[extname(path)];
  if (!mime) throw new Error(`Noma’lum aktiv turi: ${path}`);
  return `data:${mime};base64,${readAsset(path).toString("base64")}`;
};
let html = readFileSync(resolve(root, "index.html"), "utf8");
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_, path) => {
    let css = readAsset(path).toString("utf8");
    css = css.replace(/url\(([^)]+)\)/g, (match, path) => {
      path = path.replace(/^["']|["']$/g, "");
      return path.startsWith("/assets/") ? `url("${dataUrl(path)}")` : match;
    });
    return `<style>${css}</style>`;
  },
);
html = html.replace(
  /<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_, path) =>
    `<script type="module">${readAsset(path)
      .toString("utf8")
      .replace(/<\/script/gi, "<\\/script")}</script>`,
);
html = html.replace('href="/favicon.svg"', `href="${dataUrl("/favicon.svg")}"`);
if (/(?:src|href)="\/assets\//.test(html))
  throw new Error("Tashqi aktiv qoldi.");
mkdirSync("portable", { recursive: true });
writeFileSync("portable/cyber-university.html", html);
console.log(
  "Tayyor: portable/cyber-university.html — brauzerda ochiladigan bitta fayl.",
);

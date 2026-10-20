import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, extname, dirname } from "node:path";

// Resolve assets from their original HTML/CSS location before inlining them.
const root = resolve("dist");
const readAsset = (path, from = "index.html") => {
  const location = path.startsWith("/")
    ? resolve(root, path.slice(1))
    : resolve(dirname(resolve(root, from)), path);
  return readFileSync(location);
};
const dataUrl = (path, from) => {
  const mime = {
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
    ".png": "image/png",
  }[extname(path)];
  if (!mime) throw new Error(`Noma’lum aktiv turi: ${path}`);
  return `data:${mime};base64,${readAsset(path, from).toString("base64")}`;
};
let html = readAsset("index.html").toString("utf8");
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_, path) => {
    const css = readAsset(path)
      .toString("utf8")
      .replace(/url\(([^)]+)\)/g, (match, url) => {
        url = url.replace(/^["']|["']$/g, "");
        return /^(data:|https?:|#)/.test(url)
          ? match
          : `url("${dataUrl(url, path)}")`;
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
html = html.replace(
  /(<link\b[^>]*rel="icon"[^>]*href=")([^"]+)(")/,
  (_, before, path, after) => before + dataUrl(path) + after,
);
if (/(?:src|href)="(?:\.\/|\/)?assets\//.test(html))
  throw new Error("Tashqi aktiv qoldi.");
mkdirSync("portable", { recursive: true });
writeFileSync("portable/cyber-university.html", html);
// The repository’s configured Pages source serves this file without a Node build.
writeFileSync("index.html", html);
console.log(
  "Tayyor: portable/cyber-university.html — brauzerda ochiladigan bitta fayl.",
);

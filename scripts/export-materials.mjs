import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { CONFIG } from "../src/config.js";

const root = resolve("dist");
const pages = resolve(".artifacts/material-pages");
mkdirSync(pages, { recursive: true });
mkdirSync("downloads", { recursive: true });
const server = createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (!pathname.startsWith("/tanaffus/")) {
    res.writeHead(404).end();
    return;
  }
  const file = resolve(
    root,
    decodeURIComponent(pathname.slice("/tanaffus/".length)) || "index.html",
  );
  if (!file.startsWith(root + sep) || !existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
  }[extname(file)];
  res.writeHead(200, { "Content-Type": mime || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}/tanaffus/`;
let browser;
try {
  browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1472, height: 960 },
    reducedMotion: "reduce",
  });
  await page.emulateMedia({ media: "screen" });
  for (let id = 1; id <= 14; id++) {
    await page.goto(`${base}#/taqdimot/${id}`);
    await page.locator(`.slide-${id}`).waitFor();
    await page.evaluate(() => document.fonts.ready);
    if (id === 14) await page.locator(".qr").waitFor();
    await page.addStyleTag({
      content:
        "@page{size:1440px 810px!important;margin:0!important}html,body,#root{margin:0!important;padding:0!important;width:1440px!important;background:#071326!important}.app-header,.presentation-controls,.skip-link,.toast,.storage-warning{display:none!important}.presentation{height:810px!important;width:1440px!important;padding:0!important;overflow:visible!important;display:block!important}.presentation-stage{width:1440px!important;height:810px!important}.slide{transform:none!important;position:relative!important;margin:0!important}",
    });
    await page.pdf({
      path: resolve(pages, `${String(id).padStart(2, "0")}.pdf`),
      preferCSSPageSize: true,
      printBackground: true,
      scale: 1,
    });
  }
  const handout = await browser.newPage();
  await handout.goto(`${base}#/qollanma/1`);
  await handout.locator(".qr").waitFor();
  await handout.evaluate(() => document.fonts.ready);
  await handout.pdf({
    path: resolve("downloads/qisqa-qollanma.pdf"),
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true,
    scale: 1,
  });
  execFileSync(
    process.env.MATERIALS_PYTHON || "python",
    [
      "-c",
      `
import fitz,sys,pathlib
folder=pathlib.Path(sys.argv[1]);result=fitz.open()
for n in range(1,15):
 d=fitz.open(folder/f'{n:02}.pdf')
 assert len(d)==1,(n,len(d))
 assert len(d[0].get_text())>120,n
 result.insert_pdf(d)
result.set_metadata({'title':'Cyber University — Raqamli ish faoliyati','author':sys.argv[2]})
result.save('downloads/cyber-university-taqdimot.pdf',garbage=4,deflate=True)
assert len(fitz.open('downloads/qisqa-qollanma.pdf'))==1
print('Tayyor: taqdimot 14 slayd; qo‘llanma 1 A4 sahifa.')
`,
      pages,
      CONFIG.presenter,
    ],
    { stdio: "inherit" },
  );
} finally {
  if (browser) await browser.close();
  await new Promise((done) => server.close(done));
}

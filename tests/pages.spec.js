import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import { CONFIG } from "../src/config.js";

let server, address;
const dist = resolve("dist");
test.beforeAll(async () => {
  execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"]);
  server = createServer((request, response) => {
    const path = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (!path.startsWith("/tanaffus/")) {
      response.writeHead(404).end();
      return;
    }
    const file = resolve(dist, path.slice("/tanaffus/".length) || "index.html");
    if (!file.startsWith(dist + sep) || !existsSync(file)) {
      response.writeHead(404).end();
      return;
    }
    const mime = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript",
      ".css": "text/css",
      ".woff2": "font/woff2",
      ".svg": "image/svg+xml",
    }[extname(file)];
    response.writeHead(200, {
      "Content-Type": mime || "application/octet-stream",
    });
    response.end(readFileSync(file));
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  address = `http://127.0.0.1:${server.address().port}/tanaffus/`;
});
test.afterAll(async () => {
  await new Promise((done) => server.close(done));
});

test("GitHub Pages: 14 slayd /tanaffus/ ichida, barcha aktivlar to‘g‘ri ochiladi", async ({
  page,
}) => {
  const errors = [],
    failed = [],
    outside = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) failed.push(response.url());
  });
  page.on("request", (request) => {
    if (request.url().startsWith("http") && !request.url().startsWith(address))
      outside.push(request.url());
  });
  await page.setViewportSize({ width: 1366, height: 768 });
  for (let id = 1; id <= 14; id++) {
    await page.goto(`${address}#/taqdimot/${id}`);
    await expect(page.locator(`.slide-${id}`)).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".slide h1")).toHaveCount(1);
  }
  await expect(page.locator(".qr")).toBeVisible();
  const data = await page.locator(".qr").getAttribute("src");
  const png = PNG.sync.read(Buffer.from(data.split(",")[1], "base64"));
  expect(
    jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data,
  ).toBe("https://solijonov9.github.io/tanaffus/");
  expect(CONFIG.publicUrl).toBe("https://solijonov9.github.io/tanaffus/");
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
  expect(outside).toEqual([]);
});

test("GitHub Pages: telefon, to‘g‘ri havolalar va bog‘langan vazifa /tanaffus/ ichida ishlaydi", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(address + "#/oqish/9");
  await page.locator(".message-open").first().click();
  await page
    .getByRole("button", { name: "Vazifaga aylantirish", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Vazifani ochish", exact: true })
    .click();
  expect(page.url()).toBe(address + "#/oqish/10");
  await page
    .getByRole("button", { name: "Ish vaqtini ajratish", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Taqvimni ochish", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: /Oktabr hisobotini tayyorlash, 2026-10-29/,
    }),
  ).toBeVisible();
  expect(page.url()).toBe(address + "#/oqish/5");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
  await page.goto(address + "#/oqish/7");
  const pending = context.waitForEvent("page");
  await page
    .getByRole("link", { name: "Hisobot shakli", exact: false })
    .click();
  const document = await pending;
  await expect(document.locator(".sample-document")).toBeVisible();
  expect(document.url()).toBe(address + "#/hujjat/1");
  await document.close();
});

test("Nisbiy Pages aktivlari bitta HTML eksportida ham ichki joylashtiriladi", async ({
  page,
}) => {
  execFileSync(process.execPath, ["scripts/build-portable.mjs"]);
  const requests = [],
    errors = [];
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) requests.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.context().setOffline(true);
  await page.setContent(readFileSync("portable/cyber-university.html", "utf8"));
  await expect(page.locator(".intro-layout")).toBeVisible();
  await page.evaluate(() => (location.hash = "#/oqish/14"));
  await expect(page.locator(".qr")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

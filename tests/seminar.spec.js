import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { CONFIG } from "../src/config.js";
import { sections, clues } from "../src/data.js";
const errors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const e = [];
  errors.set(page, e);
  page.on("pageerror", (error) => e.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") e.push(message.text());
  });
});
test.afterEach(async ({ page }) => expect(errors.get(page)).toEqual([]));
async function read(page, id) {
  await page.goto(`/#/oqish/${id}`);
  await expect(page.locator(`#bolim-${id}`)).toBeVisible();
}
async function slide(page, id) {
  await page.goto(`/#/taqdimot/${id}`);
  await expect(page.locator(`.slide-${id}`)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}
async function fit(page) {
  return page.locator(".slide").evaluate((slide) => {
    const limit = slide
      .querySelector(".slide-bottomline")
      .getBoundingClientRect().top;
    const nodes = [...slide.querySelectorAll(".slide-body *")].filter(
      (e) =>
        !e.closest("dialog") &&
        e.getBoundingClientRect().height &&
        getComputedStyle(e).position !== "absolute",
    );
    return {
      overflow:
        Math.max(...nodes.map((e) => e.getBoundingClientRect().bottom)) - limit,
      scroll: document.documentElement.scrollHeight - innerHeight,
      horizontal: document.documentElement.scrollWidth - innerWidth,
    };
  });
}
async function eventForm(page, title = "Sinov yig‘ilishi") {
  await page.getByRole("button", { name: "Yangi tadbir", exact: true }).click();
  await page.getByLabel("Tadbir nomi", { exact: true }).fill(title);
  await page.getByLabel("Sana", { exact: true }).fill("2026-12-03");
  await page.getByLabel("Boshlanish vaqti", { exact: true }).fill("10:00");
  await page.getByLabel("Tugash vaqti", { exact: true }).fill("10:30");
}
function state(page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("cyber-seminar-demo-v1")),
  );
}
for (const viewport of [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
]) {
  test(`14 slayd chegaradan chiqmaydi: ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    expect(sections).toHaveLength(14);
    for (let i = 1; i <= 14; i++) {
      await slide(page, i);
      expect(await page.locator(".slide").count()).toBe(1);
      const bounds = await fit(page);
      expect(bounds.overflow, `slayd ${i}`).toBeLessThanOrEqual(0);
      expect(bounds.scroll).toBeLessThanOrEqual(0);
      expect(bounds.horizontal).toBeLessThanOrEqual(0);
      await expect(page.locator(".slide h1")).not.toBeEmpty();
      await expect(page.locator(".slide-notes")).toHaveCount(0);
    }
  });
}
test("390×844: barcha bo‘limlar o‘qiladi, gorizontal siljish yo‘q", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (let i = 1; i <= 14; i++) {
    await read(page, i);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
      `bo‘lim ${i}`,
    ).toBeLessThanOrEqual(0);
    await expect(page.locator("article h1")).toBeVisible();
    await page.locator(".reading-details summary").click();
    await expect(page.locator(".reading-details p")).toBeVisible();
  }
  await page.screenshot({
    path: ".artifacts/mobile-ending.png",
    fullPage: true,
  });
});
test("kamaytirilgan harakatda to‘liq kontent", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (let i = 1; i <= 14; i++) {
    await slide(page, i);
    await expect(page.locator(".slide-body")).not.toBeEmpty();
    expect((await fit(page)).overflow).toBeLessThanOrEqual(0);
  }
  await expect(page.locator(".qr")).toBeVisible();
});
test("slayd klaviaturasi: strelkalar, Home, End va Space", async ({ page }) => {
  await slide(page, 2);
  await page.locator("main").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/taqdimot\/3$/);
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/taqdimot\/2$/);
  await page.keyboard.press("Home");
  await expect(page).toHaveURL(/taqdimot\/1$/);
  await page.keyboard.press("End");
  await expect(page).toHaveURL(/taqdimot\/14$/);
  await page.keyboard.press("Home");
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(/taqdimot\/2$/);
});
test("kiritish maydoni, select, tugma va dialog slaydni almashtirmaydi", async ({
  page,
}) => {
  await slide(page, 9);
  await page
    .getByRole("textbox", { name: "Xatlardan qidirish" })
    .fill("hisobot");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(/taqdimot\/9$/);
  await page.locator(".category-select").first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(page).toHaveURL(/taqdimot\/9$/);
  await page.getByRole("button", { name: "Slaydlar sharhi" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/taqdimot\/9$/);
  await page.keyboard.press("Space");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("End");
  await expect(page).toHaveURL(/taqdimot\/9$/);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Slaydlar sharhi" }),
  ).toBeFocused();
});
test("to‘g‘ridan-to‘g‘ri havolalar, Back / Forward va oxirgi bo‘lim", async ({
  page,
}) => {
  await read(page, 4);
  await page.getByRole("link", { name: "Taqdimotda ochish" }).click();
  await expect(page).toHaveURL(/taqdimot\/4$/);
  await page.goBack();
  await expect(page).toHaveURL(/oqish\/4$/);
  await page.goForward();
  await expect(page).toHaveURL(/taqdimot\/4$/);
  await read(page, 7);
  await page.goto("/");
  await expect(page.locator("#bolim-7")).toBeVisible();
  await page.reload();
  await expect(page.locator("#bolim-7")).toBeVisible();
});
test("to‘liq ekran rad etilsa foydalanish mumkin bo‘lgan zaxira", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new Error("test denial"));
  });
  await slide(page, 3);
  await page.getByRole("button", { name: "To‘liq ekran", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Brauzer to‘liq ekranga ruxsat bermadi",
  );
  await expect(page.locator(".slide-3")).toBeVisible();
  await page.getByRole("button", { name: "Keyingi slayd" }).click();
  await expect(page).toHaveURL(/taqdimot\/4$/);
});
test("taqvim: yaratish, boshqa hafta, tahrirlash va o‘chirish", async ({
  page,
}) => {
  await read(page, 5);
  await eventForm(page);
  await page
    .getByLabel("Namuna ishtirokchi manzili")
    .fill("hamkasb@example.com");
  await page.getByLabel("Uchrashuv havolasi namunasini qo‘shish").check();
  await expect(page.getByRole("dialog")).toContainText(
    "meeting.example.invalid",
  );
  await page.getByRole("button", { name: "Saqlash", exact: true }).click();
  await expect(page.locator(".week-control")).toContainText("2026");
  const e = page.getByRole("button", { name: /Sinov yig‘ilishi, 2026-12-03/ });
  await expect(e).toBeVisible();
  await e.click();
  await page
    .getByLabel("Tadbir nomi", { exact: true })
    .fill("Yangilangan yig‘ilish");
  await page.getByRole("button", { name: "Saqlash", exact: true }).click();
  await page
    .getByRole("button", { name: /Yangilangan yig‘ilish, 2026-12-03/ })
    .click();
  await page.getByRole("button", { name: "O‘chirish", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Yangilangan yig‘ilish, 2026-12-03/ }),
  ).toHaveCount(0);
  expect((await state(page)).events).toHaveLength(2);
});
test("taqvim majburiy maydonlar va noto‘g‘ri vaqtni izohlaydi", async ({
  page,
}) => {
  await read(page, 5);
  await page.getByRole("button", { name: "Yangi tadbir", exact: true }).click();
  await page.getByLabel("Sana", { exact: true }).fill("");
  await page.getByLabel("Tugash vaqti", { exact: true }).fill("13:00");
  await page.getByRole("button", { name: "Saqlash", exact: true }).click();
  await expect(page.getByText("Tadbir nomini kiriting.")).toBeVisible();
  await expect(page.getByText("Sanani tanlang.")).toBeVisible();
  await expect(
    page.getByText("Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak."),
  ).toBeVisible();
  expect((await state(page)).events).toHaveLength(2);
  await page.getByLabel("Tadbir nomi", { exact: true }).fill("Sinov");
  await page.getByLabel("Sana", { exact: true }).fill("2026-10-29");
  await page.getByLabel("Tugash vaqti", { exact: true }).fill("14:45");
  await page.getByLabel("Namuna ishtirokchi manzili").fill("person@real.org");
  await page.getByRole("button", { name: "Saqlash", exact: true }).click();
  await expect(
    page.getByText(
      "Faqat example.com yoki example.invalid dagi namuna manzilini kiriting.",
    ),
  ).toBeVisible();
});
test("haftalik takrorlash 8 hafta; eslatma aniq mahalliy namuna", async ({
  page,
}) => {
  await read(page, 5);
  await eventForm(page, "Takroriy uchrashuv");
  await page.getByLabel("Takrorlash", { exact: true }).selectOption("weekly");
  await page.getByRole("button", { name: "Saqlash", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Takroriy uchrashuv, 2026-12-03/ }),
  ).toBeVisible();
  for (let i = 1; i < 8; i++) {
    await page
      .getByRole("button", { name: "Keyingi hafta", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: /Takroriy uchrashuv, / }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Keyingi hafta", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Takroriy uchrashuv, / }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Eslatma namunasi", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Namuna: yig‘ilishga 15 daqiqa qoldi.",
  );
  await expect(page.getByRole("status")).toContainText(
    "fon bildirishnomasi rejalashtirilmagan",
  );
});
test("inbox: sender, subject, body qidiruvi, yulduz, toifa, arxiv va qaytarish", async ({
  page,
}) => {
  await read(page, 9);
  const search = page.getByRole("textbox", { name: "Xatlardan qidirish" });
  for (const q of [
    "kafedra@example.com",
    "Oktabr hisoboti",
    "hisobot shakli",
  ]) {
    await search.fill(q);
    await expect(page.locator(".message-row")).toHaveCount(1);
  }
  await page.locator(".star-button").click();
  await expect(page.locator(".star-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator(".category-select").selectOption("Ilmiy");
  await expect(page.locator(".category-select")).toHaveValue("Ilmiy");
  await page
    .locator(".message-row")
    .getByRole("button", { name: /arxivlash$/ })
    .click();
  await expect(page.locator(".message-row")).toHaveCount(0);
  await page.getByRole("button", { name: /^Arxiv/ }).click();
  await expect(page.locator(".message-row")).toHaveCount(1);
  await page
    .locator(".message-row")
    .getByRole("button", { name: /arxivdan qaytarish$/ })
    .click();
  await page.getByRole("button", { name: /^Kiruvchi/ }).click();
  await expect(page.locator(".message-row")).toHaveCount(1);
  await search.fill("");
  await expect(page.locator(".message-row")).toHaveCount(6);
  await page.reload();
  await expect(page.locator(".star-button").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".category-select").first()).toHaveValue("Ilmiy");
});
test("umumiy zanjir: xat → vazifa → taqvim → natija va mahalliy loyiha", async ({
  page,
}) => {
  const network = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") network.push(r.url());
  });
  await read(page, 9);
  await page.locator(".message-open").first().click();
  await page
    .getByRole("button", { name: "Vazifaga aylantirish", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mavjud vazifani tekshirish", exact: true })
    .click();
  expect((await state(page)).tasks).toHaveLength(1);
  await page
    .getByRole("link", { name: "Vazifani ochish", exact: true })
    .click();
  await expect(page.locator("#bolim-10")).toBeVisible();
  await page
    .getByRole("button", { name: "Ish vaqtini ajratish", exact: true })
    .click();
  expect(
    (await state(page)).events.find((e) => e.taskId === "task-report"),
  ).toMatchObject({ date: "2026-10-29", start: "14:00", end: "14:45" });
  await page
    .getByRole("link", { name: "Taqvimni ochish", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Oktabr hisobotini tayyorlash, 2026-10-29/ })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Hisobot vazifasi bilan bog‘langan",
  );
  await page.keyboard.press("Escape");
  await read(page, 10);
  await page.getByLabel("Hisobot natijasi tayyor").check();
  await page
    .getByRole("button", { name: "Javob loyihasini yozish", exact: true })
    .click();
  await page
    .getByLabel("Javob matni")
    .fill(
      "Hisobot tayyor. Ruxsatlar tekshirildi. Hurmat bilan, Namuna o‘qituvchi.",
    );
  await page
    .getByRole("button", { name: "Loyihani saqlash", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Hech qanday xat yuborilmadi",
  );
  await page
    .getByRole("button", { name: "Bajarildi deb belgilash", exact: true })
    .click();
  await expect(page.locator(".task-header .tag")).toContainText("Bajarildi");
  await read(page, 9);
  await expect(page.locator(".message-row").first()).toContainText("Bajarildi");
  await read(page, 5);
  await expect(
    page.getByRole("button", {
      name: /Oktabr hisobotini tayyorlash, 2026-10-29/,
    }),
  ).toContainText("Bajarildi");
  await page.reload();
  expect((await state(page)).tasks[0]).toMatchObject({
    done: true,
    draft:
      "Hisobot tayyor. Ruxsatlar tekshirildi. Hurmat bilan, Namuna o‘qituvchi.",
  });
  expect(network).toEqual([]);
});
test("ustuvorlik klaviatura bilan tanlanadi", async ({ page }) => {
  await read(page, 4);
  for (let i = 0; i < 4; i++) {
    const q = page.locator(".quadrant").nth(i);
    await q.focus();
    await page.keyboard.press("Enter");
    await expect(q).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".matrix-detail p")).not.toBeEmpty();
  }
  await expect(page.locator(".matrix-detail")).toContainText(
    "Ishga aloqasiz bildirishnoma",
  );
});
test("To va Cc: xato va to‘g‘ri tanlovning darhol izohi", async ({ page }) => {
  await read(page, 8);
  const fields = page.locator("fieldset");
  await fields.nth(0).getByRole("button", { name: "Bcc", exact: true }).click();
  await expect(fields.nth(0).getByRole("status")).toContainText("To kerak");
  await fields.nth(0).getByRole("button", { name: "To", exact: true }).click();
  await expect(fields.nth(0).getByRole("status")).toContainText("To‘g‘ri");
  await fields.nth(1).getByRole("button", { name: "To", exact: true }).click();
  await expect(fields.nth(1).getByRole("status")).toContainText("Cc kerak");
  await fields.nth(1).getByRole("button", { name: "Cc", exact: true }).click();
  await expect(fields.nth(1).getByRole("status")).toContainText("To‘g‘ri");
});
test("phishing: barcha matn darhol ko‘rinadi; 5 belgi, izohlar va tiklash", async ({
  page,
}) => {
  await read(page, 12);
  const email = page.locator(".phishing-email");
  for (const text of [
    "IT Support <security-alert@example.invalid>",
    "DIQQAT! Hisobingiz 30 daqiqadan keyin bloklanadi!",
    "Hisobingizni faol saqlab qolish uchun darhol",
    "parolingizni tasdiqlang.",
    "https://account-check.example.invalid/verify",
  ])
    await expect(email).toContainText(text);
  await expect(email.locator("a,input")).toHaveCount(0);
  for (let i = 0; i < 5; i++) {
    await page.locator(".clue-button").nth(i).click();
    await expect(page.locator(".clue-explanation")).toHaveText(clues[i].text);
    await expect(page.locator(".marked")).toHaveCount(1);
  }
  await expect(page.locator(".clue-progress")).toContainText("5/5");
  await page
    .getByRole("button", { name: "Barcha izohlarni ko‘rsatish", exact: true })
    .click();
  await expect(page.locator(".clue-explanation")).toHaveCount(5);
  await page
    .getByRole("button", { name: "Mashqni qayta boshlash", exact: true })
    .click();
  await expect(page.locator(".clue-progress")).toContainText("0/5");
  await expect(page.locator(".clue-explanation")).toHaveCount(0);
  await expect(email).toContainText("parolingizni tasdiqlang.");
});
test("phishing proyektorda: har belgi sig‘adi va barcha izohlar dialogda ochiladi", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await slide(page, 12);
  for (let i = 0; i < 5; i++) {
    await page.locator(".clue-button").nth(i).click();
    expect((await fit(page)).overflow, `belgi ${i}`).toBeLessThanOrEqual(0);
  }
  await page
    .getByRole("button", { name: "Barcha izohlarni ko‘rsatish", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator("section")).toHaveCount(5);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("yakuniy savol uchala variantni izohlaydi; faqat B to‘g‘ri", async ({
  page,
}) => {
  await read(page, 13);
  for (let i = 0; i < 3; i++) {
    await page.locator(".answer-option").nth(i).click();
    await expect(page.locator(".answer-explanation")).not.toBeEmpty();
    if (i === 1)
      await expect(page.locator(".answer-explanation")).toContainText(
        "To‘g‘ri",
      );
    else
      await expect(page.locator(".answer-explanation")).not.toContainText(
        "To‘g‘ri",
      );
  }
  await page
    .getByRole("button", { name: "Faqat ushbu javobni tiklash", exact: true })
    .click();
  await expect(page.locator(".answer-explanation")).toHaveCount(0);
});
test("lokal tiklash boshqa mashqlarga ta’sir qilmaydi; global tiklash tasdiq so‘raydi", async ({
  page,
}) => {
  await read(page, 10);
  await page
    .getByRole("button", { name: "Hisobotdan vazifa yaratish", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ish vaqtini ajratish", exact: true })
    .click();
  await read(page, 5);
  await page
    .getByRole("button", {
      name: "Boshlang‘ich holatga qaytarish",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Vazifalar va xatlar saqlanadi",
  );
  await page
    .getByRole("button", { name: "Taqvimni tiklash", exact: true })
    .click();
  expect((await state(page)).events).toHaveLength(2);
  expect((await state(page)).tasks).toHaveLength(1);
  await page
    .getByRole("button", { name: "Barcha mashqlarni tiklash", exact: true })
    .click();
  await page.getByRole("button", { name: "Bekor qilish", exact: true }).click();
  expect((await state(page)).tasks).toHaveLength(1);
  await page
    .getByRole("button", { name: "Barcha mashqlarni tiklash", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Barchasini tiklash", exact: true })
    .click();
  expect((await state(page)).tasks).toHaveLength(0);
  expect((await state(page)).events).toHaveLength(2);
  await read(page, 12);
  await page.locator(".clue-button").first().click();
  await expect(page.locator(".clue-explanation")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Barcha mashqlarni tiklash", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Barchasini tiklash", exact: true })
    .click();
  await expect(page.locator(".clue-progress")).toContainText("0/5");
  await expect(page.locator(".clue-explanation")).toHaveCount(0);
  await expect(page.locator(".marked")).toHaveCount(0);
});
test("taymer: boshlash, pauza, davom ettirish, ko‘rinish almashishi va tiklash", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/#/maruzachi/1");
  await page.getByRole("button", { name: "Boshlash", exact: true }).click();
  await page.clock.fastForward(5200);
  await expect(page.getByRole("timer")).toContainText("00:05");
  await page.getByRole("button", { name: "Pauza", exact: true }).click();
  await page.clock.fastForward(10000);
  await expect(page.getByRole("timer")).toContainText("00:05");
  await page.getByRole("button", { name: "Boshlash", exact: true }).click();
  await page.clock.fastForward(2000);
  await expect(page.getByRole("timer")).toContainText("00:07");
  await page
    .getByRole("link", { name: "Taqdimotni ochish", exact: true })
    .click();
  await page.getByRole("link", { name: "Ma’ruzachi", exact: true }).click();
  await expect(page.getByRole("timer")).toContainText("00:07");
  await page
    .getByRole("button", { name: "Taymerni nolga qaytarish", exact: true })
    .click();
  await expect(page.getByRole("timer")).toContainText("00:00");
});
test("30 daqiqa, so‘nggi ikki daqiqa savollarga; 14 eslatma va jonli checklist", async ({
  page,
}) => {
  await page.goto("/#/maruzachi/1");
  const ranges = await page.locator(".plan-card-header>span").allTextContents();
  let previous = 0;
  for (const range of ranges) {
    const [start, end] = range.split("–").map((t) => {
      const [m, s] = t.split(":").map(Number);
      return m * 60 + s;
    });
    expect(start).toBe(previous);
    previous = end;
  }
  expect(previous).toBe(1800);
  expect(ranges.at(-1)).toBe("28:00–30:00");
  await page
    .getByRole("tab", { name: "14 slayd eslatmalari", exact: true })
    .click();
  await expect(page.locator(".slide-notes section")).toHaveCount(14);
  await page.getByRole("tab", { name: "Jonli namoyish", exact: true }).click();
  await expect(page.locator(".live-guide li")).toHaveCount(13);
  await expect(page.locator(".live-guide")).toContainText(
    "imkoniyatlar hisob va interfeysga bog‘liq",
  );
});
test("QR rasmlari haqiqiy va aynan konfiguratsiya manzilini kodlaydi", async ({
  page,
}) => {
  for (const route of ["/#/oqish/14", "/#/qollanma"]) {
    await page.goto(route);
    await expect(page.locator(".qr")).toBeVisible();
    const data = await page.locator(".qr").getAttribute("src");
    const png = PNG.sync.read(Buffer.from(data.split(",")[1], "base64"));
    const decoded = jsQR(
      new Uint8ClampedArray(png.data),
      png.width,
      png.height,
    );
    expect(decoded?.data).toBe(CONFIG.publicUrl);
  }
  await page.goto("/");
  await expect(page.locator(".reading-main")).toBeVisible();
});
test("A4 qo‘llanma 100% masshtabda bir sahifa; alohida ma’ruzachi PDF to‘liq", async ({
  page,
}) => {
  mkdirSync(".artifacts", { recursive: true });
  await page.goto("/#/qollanma");
  await expect(page.locator(".qr")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: ".artifacts/handout.pdf",
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true,
    scale: 1,
  });
  const result = JSON.parse(
    execFileSync("python", [
      "-c",
      `import fitz,json; d=fitz.open('.artifacts/handout.pdf'); print(json.dumps({'pages':len(d),'text':''.join(p.get_text() for p in d),'bounds':all(b[0]>=20 and b[1]>=20 and b[2]<=p.rect.width-20 and b[3]<=p.rect.height-20 for p in d for b in p.get_text('blocks'))}))`,
    ]).toString(),
  );
  expect(result.pages).toBe(1);
  expect(result.bounds).toBe(true);
  for (const word of [
    "Raqamli ish faoliyati:",
    "Har kungi besh odat",
    "Besh xavfsizlik qoidasi",
    "Material va amaliy mashqlar",
    CONFIG.publicUrl,
  ])
    expect(result.text).toContain(word);
  await page.goto("/#/maruzachi-chop");
  await expect(page.locator(".slide-notes section")).toHaveCount(14);
  await page.pdf({
    path: ".artifacts/presenter-guide.pdf",
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true,
  });
  const guide = execFileSync("python", [
    "-c",
    `import fitz; print(''.join(p.get_text() for p in fitz.open('.artifacts/presenter-guide.pdf')))`,
  ]).toString();
  expect(guide).toContain("28:00–30:00");
  expect(guide).toContain("SLAYD 14");
  expect(guide).toContain("Google Meet");
});
test("chop etish tugmasi brauzer dialogini chaqiradi; hujjat havolasi mahalliy", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    window.print = () => {
      window.__printed = true;
    };
  });
  await page.goto("/#/qollanma");
  await page
    .getByRole("button", {
      name: "Chop etish / PDF sifatida saqlash",
      exact: true,
    })
    .click();
  expect(await page.evaluate(() => window.__printed)).toBe(true);
  await read(page, 7);
  const pending = context.waitForEvent("page");
  await page
    .getByRole("link", { name: "Hisobot shakli", exact: false })
    .click();
  const doc = await pending;
  await expect(doc.locator(".sample-document")).toContainText("Hisobot shakli");
  expect(new URL(doc.url()).origin).toBe(new URL(page.url()).origin);
  await doc.close();
});
test("buzilgan yoki mavjud bo‘lmagan browser xotirasi asosiy ishni to‘xtatmaydi", async ({
  page,
  context,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "cyber-seminar-demo-v1",
      '{"version":1,"events":[null]}',
    ),
  );
  await read(page, 9);
  await expect(page.locator(".message-row")).toHaveCount(6);
  const blocked = await context.newPage();
  await blocked.addInitScript(() => {
    Storage.prototype.getItem = function () {
      throw new Error("blocked");
    };
    Storage.prototype.setItem = function () {
      throw new Error("blocked");
    };
  });
  await read(blocked, 10);
  await blocked
    .getByRole("button", { name: "Hisobotdan vazifa yaratish", exact: true })
    .click();
  await expect(blocked.locator(".task-header .tag")).toContainText("Jarayonda");
  await expect(blocked.locator(".storage-warning")).toBeVisible();
  await blocked.close();
});
test("WCAG 2 AA: asosiy sahifa, mashqlar, dialog va ma’ruzachi", async ({
  page,
}) => {
  for (const route of [
    "/#/oqish/1",
    "/#/oqish/5",
    "/#/oqish/9",
    "/#/oqish/12",
    "/#/maruzachi/1",
    "/#/qollanma",
  ]) {
    await page.goto(route);
    await page.locator("main").waitFor();
    await page.evaluate(() => document.fonts.ready);
    const a = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(a.violations, route).toEqual([]);
  }
  await read(page, 5);
  await page.getByRole("button", { name: "Yangi tadbir", exact: true }).click();
  const a = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(a.violations).toEqual([]);
});

test("mashq natijalari va zich taqvim ham proyektorga sig‘adi", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await slide(page, 8);
  for (const choice of ["Bcc", "To", "Cc"]) {
    for (const field of await page.locator("fieldset").all())
      await field.getByRole("button", { name: choice, exact: true }).click();
    expect((await fit(page)).overflow).toBeLessThanOrEqual(0);
  }
  await slide(page, 10);
  await page
    .getByRole("button", { name: "Hisobotdan vazifa yaratish", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ish vaqtini ajratish", exact: true })
    .click();
  await page.getByLabel("Hisobot natijasi tayyor").check();
  await page
    .getByRole("button", { name: "Javob loyihasini yozish", exact: true })
    .click();
  await page.getByLabel("Javob matni").fill("Natija tayyor. Mahalliy loyiha.");
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/taqdimot\/10$/);
  await page
    .getByRole("button", { name: "Loyihani saqlash", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Bajarildi deb belgilash", exact: true })
    .click();
  expect((await fit(page)).overflow).toBeLessThanOrEqual(0);
  await slide(page, 5);
  for (let i = 0; i < 3; i++) {
    await eventForm(page, `Qo‘shimcha tadbir ${i + 1}`);
    await page.getByLabel("Sana", { exact: true }).fill("2026-10-29");
    await page.getByRole("button", { name: "Saqlash", exact: true }).click();
  }
  expect((await fit(page)).overflow).toBeLessThanOrEqual(0);
  await page
    .getByRole("button", { name: "Yana 3 ta tadbir", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").locator(".all-day-events button"),
  ).toHaveCount(5);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Qo‘shimcha tadbir 3/ })
    .click();
  await expect(page.getByLabel("Tadbir nomi", { exact: true })).toHaveValue(
    "Qo‘shimcha tadbir 3",
  );
  await page.keyboard.press("Escape");
  await slide(page, 13);
  for (let i = 0; i < 3; i++) {
    await page.locator(".answer-option").nth(i).click();
    expect((await fit(page)).overflow).toBeLessThanOrEqual(0);
  }
});

test.describe("Telefon orqali mashqlar", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  test("taqvim, qabul qiluvchilar, xat va phishing sensor orqali ishlaydi", async ({
    page,
  }) => {
    await read(page, 5);
    await page.getByRole("button", { name: "Yangi tadbir", exact: true }).tap();
    await page.getByLabel("Tadbir nomi", { exact: true }).fill("Mobil sinov");
    await page.getByRole("button", { name: "Saqlash", exact: true }).tap();
    await expect(
      page.getByRole("button", { name: /Mobil sinov, / }),
    ).toBeVisible();
    await read(page, 8);
    await page
      .locator("fieldset")
      .first()
      .getByRole("button", { name: "To", exact: true })
      .tap();
    await expect(
      page.locator("fieldset").first().getByRole("status"),
    ).toContainText("To‘g‘ri");
    await read(page, 9);
    await page.locator(".message-open").first().tap();
    await page
      .getByRole("button", { name: "Vazifaga aylantirish", exact: true })
      .tap();
    await page
      .getByRole("link", { name: "Vazifani ochish", exact: true })
      .tap();
    await page
      .getByRole("button", { name: "Ish vaqtini ajratish", exact: true })
      .tap();
    expect(
      (await state(page)).events.some((e) => e.taskId === "task-report"),
    ).toBe(true);
    await read(page, 12);
    for (let i = 0; i < 5; i++) await page.locator(".clue-button").nth(i).tap();
    await expect(page.locator(".clue-progress")).toContainText("5/5");
    await page
      .getByRole("button", {
        name: "Bo‘limlar mundarijasini ochish",
        exact: true,
      })
      .tap();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: /14.*Yakun va QR/ })
      .tap();
    await expect(page.locator(".qr")).toBeVisible();
    await page
      .getByRole("button", { name: "Barcha mashqlarni tiklash", exact: true })
      .tap();
    await page
      .getByRole("button", { name: "Barchasini tiklash", exact: true })
      .tap();
    expect((await state(page)).tasks).toHaveLength(0);
  });
});

# Cyber University — raqamli ish faoliyati

Professor-o‘qituvchilar va xodimlar uchun o‘zbek tilidagi 30 daqiqalik amaliy seminar. Asosiy jarayon: **ELEKTRON XAT → VAZIFA → TAQVIM → NATIJA**.

## Ishga tushirish

Node.js 22.12 yoki yangiroq versiya kerak (bu muhitda Node.js 24 ishlatilgan).

```sh
npm ci
npm run dev
```

`npm run build` statik saytni `dist/` katalogiga yig‘adi. `npm run preview` yig‘ilgan saytni mahalliy tekshirish uchun ochadi. Backend, autentifikatsiya, Google hisobi yoki pulli integratsiya talab qilinmaydi. Shriftlar va ikonalar loyiha bilan birga yig‘iladi.

## Ko‘rinishlar

| URL holati | Mazmun |
| --- | --- |
| `/#/oqish/1` … `/#/oqish/14` | Telefon uchun o‘qish ko‘rinishi, izohlar va mashqlar |
| `/#/taqdimot/1` … `/#/taqdimot/14` | 16:9 formatidagi aynan 14 slayd |
| `/#/maruzachi/1` | 30 daqiqalik reja, slayd eslatmalari, ixtiyoriy Google namoyishi va qo‘lda boshqariladigan taymer |
| `/#/qollanma/1` | Bir A4 sahifalik auditoriya qo‘llanmasi |
| `/#/maruzachi-chop/1` | Alohida chop etiladigan to‘liq ma’ruzachi qo‘llanmasi |
| `/#/hujjat/1` | Mahalliy hisobot hujjati namunasi |

Ildiz manzil o‘qish ko‘rinishini ochadi. Brauzer xotirasi mavjud bo‘lsa, avvalgi o‘qilgan bo‘lim eslanadi. URL orqali ochilgan aniq bo‘lim ustun turadi. Back va Forward ishlaydi. Ma’ruzachi ko‘rinishi alohida, lekin kirish nazorati bilan himoyalanmagan.

Taqdimot: ← / →, Home, End va Space. Maydonlar, tugmalar, havolalar va dialoglarda bu tugmalar slaydni almashtirmaydi. Slaydlar avtomatik o‘tmaydi. To‘liq ekran rad etilsa, oynaga mos keng ko‘rinish ishlaydi.

## Sozlamalar

`src/config.js` ichida quyidagilar bir joyda sozlanadi:

- `publicUrl`: hozir `https://solijonov9.github.io/tanaffus/`. QR aynan shu manzilni kodlaydi, unga yashirin parametr qo‘shmaydi. Saytni joylashtirganda manzilni haqiqiy, mobil o‘qish ko‘rinishini ochadigan ildiz manzilga moslang va qayta yig‘ing.
- `presenter`: Madaminbek Solijonov.
- `role`: Kiberxavfsizlik kafedrasi o‘qituvchisi.
- `seminarDate`: ataylab bo‘sh. Tasdiqlangan tadbir sanasi bo‘lsa kiriting; sayt sana o‘ylab topmaydi.

Hash yo‘llari statik hostingda alohida server marshrutlarini talab qilmaydi. Yig‘ish nisbiy aktiv yo‘llarini ishlatadi: domen ildizida ham, GitHub Pages’dagi `/tanaffus/` papkasida ham ochiladi. Ushbu kodning yozilishi sayt tashqi domenda e’lon qilinganini anglatmaydi. Offline ishlash va xizmat ishchisi qo‘shilmagan.

## Simulyatsiya

`src/state.jsx` yagona, versiyalangan mahalliy holatni boshqaradi. Xatlar, vazifalar, taqvim tadbirlari va mashqlar bog‘langan. `report → task-report → event-task-report` munosabati bo‘limlar orasida saqlanadi. Takror vazifa yaratilmaydi. Natijani belgilash va javob loyihasini saqlashdan keyin vazifa bajarilgan deb belgilanadi. Xat, vazifa va taqvimda bir xil holat ko‘rinadi.

- Taqvimda yaratish, tahrirlash, o‘chirish, boshqa haftaga o‘tish va 8 haftalik takrorlash ishlaydi. Zich kunlarda qolgan tadbirlar alohida ro‘yxatda ochiladi.
- Taqvimni tiklash faqat tadbirlarni o‘chiradi, vazifalarni saqlaydi. Bog‘langan ish vaqti o‘chsa, uni vazifadan yana yaratish mumkin.
- Qabul qiluvchi, phishing va yakuniy savol tiklashlari faqat o‘z mashqiga ta’sir qiladi.
- Yuqoridagi tiklash tugmasi tasdiqlashdan so‘ng barcha namuna ma’lumotlarini qaytaradi; taymer o‘zgarmaydi.
- `localStorage` mavjud bo‘lmasa, joriy sahifada xotiradagi holat ishlaydi. Buzilgan saqlash ma’lumoti boshlang‘ich namunalarga qaytariladi.

Hech qanday haqiqiy xat, taklif yoki bildirishnoma yuborilmaydi. Eslatma tugma bosilgandagina namuna sifatida chiqadi. Uchrashuv havolasi bosilmaydigan `.invalid` namunadir. Parol yoki tasdiqlash kodi so‘ralmaydi. Shaxsiy ma’lumot yoki hisob ma’lumotini mashqlarga kiritmang.

`mail.csu.uz` provayderi va Google bilan integratsiyalari tasdiqlanmagan. Gmail, Google Tasks, Google Calendar, Google Docs va Google Meet faqat ixtiyoriy tashqi namoyish misollaridir.

## Tekshirish

```sh
npm test
npm run build
npm run format:check
```

Playwright dev-serverni avtomatik ishga tushiradi yoki 5173 portidagi mavjud serverdan foydalanadi. Ushbu muhitdagi `/usr/bin/chromium` ishlatiladi; boshqa muhitda `npx playwright install chromium` bilan brauzerni o‘rnating. `CHROMIUM_PATH` orqali boshqa Chromium bajariladigan faylini berish mumkin. PDF tekshiruvi Python va PyMuPDF talab qiladi (`python -m pip install pymupdf`).

Sinovlar 14 slaydni 1366×768 va 1920×1080 da, 14 o‘qish bo‘limini 390×844 da, kamaytirilgan animatsiya, klaviatura, tarix, mahalliy saqlash, dialoglar, taqvim, pochta, bog‘langan vazifalar, mashqlar va taymerni tekshiradi. QR kodlari `jsQR` bilan qayta o‘qiladi. Axe asosiy ko‘rinishlar va dialogni WCAG 2 AA qoidalari bilan tekshiradi; bu qo‘lda to‘liq accessibility audit o‘rnini bosmaydi.

Chromium orqali olingan `.artifacts/handout.pdf` sahifa soni, matn tarkibi va chegaralari PyMuPDF bilan tekshiriladi; ma’ruzachi PDF alohida yaratiladi. Qo‘llanmani A4, 100% masshtabda va brauzerning qo‘shimcha sarlavha/pastki yozuvlarisiz chop eting. “Chop etish / PDF sifatida saqlash” brauzer dialogini ochadi; avtomatik PDF yuklab bermaydi.

Sinov natijalari `test-results/` va `.artifacts/` ichida, Gitga kiritilmaydi. Joriy avtomatlashtirilgan tekshiruvlar Chromium’da bajariladi; Safari, Firefox va haqiqiy proyektorda alohida tekshirish mumkin.

## Windows va terminalsiz nusxa

`/workspace/tanaffus` faqat Codex muhitidagi manzil. Windows CMD yoki PowerShell ichida bu manzilni ishlatmang. Oddiy loyiha bilan ishlash uchun avval saytning to‘liq fayllarini Windows kompyuteringizga oling, `package.json` turgan papkani oching va o‘sha papkada terminalni ishga tushiring. Shundan keyin Node.js o‘rnatilgan bo‘lsa `npm ci` va `npm run dev` ishlaydi.

Alohida bitta faylli nusxani tayyorlash:

```sh
npm run build:portable
```

Natija: `portable/cyber-university.html`. Tayyor HTML fayli kompyuterga olingach, uni brauzerda ikki marta bosib ochish mumkin: Node.js, terminal yoki mahalliy server talab qilinmaydi. Ushbu eksportda JavaScript, CSS, shriftlar va belgi ichki joylashtiriladi. Chromium’da HTML xotiradan yuklanib, internet o‘chirilgan holatda 14 slayd, xat–vazifa–taqvim bog‘lanishi va QR tekshirildi. Ushbu boshqariladigan brauzer file:// ochilishini administrator siyosati bilan cheklagani uchun faylni ikki marta bosib ochish bu muhitda tekshirilmagan. Oddiy `dist/` saytida xizmat ishchisi mavjud emas; bu alohida HTML nusxaning tekshiruvidir. Tashqi sayt havolalari uchun internet kerak. Bu faylni yaratishning o‘zi yuklash havolasi yaratmaydi yoki saytni internetga joylashtirmaydi.


## GitHub Pages

Sayt manzili: **https://solijonov9.github.io/tanaffus/**. O‘qish ko‘rinishi shu manzilda, taqdimot `#/taqdimot/1` holatida ochiladi. QR va chop etiladigan qo‘llanma shu manzilni ishlatadi.

GitHub nashr yozuvlariga ko‘ra, mavjud Pages manbasi `codex/cyber-university-seminar` tarmog‘ining ildizidir. Shu sababli ildizdagi `index.html` — barcha aktivlari ichki joylashtirilgan tayyor sayt. `.nojekyll` fayli uni statik nashr sifatida belgilaydi. Qo‘lda sozlash zarur bo‘lsa: **Settings → Pages → Deploy from a branch → codex/cyber-university-seminar → / (root) → Save**.

Tahrirlanadigan Vite HTML kirish fayli — **`seminar-source.html`**. `vite.config.js` uni dev-serverda va yig‘ishda ishlatadi; hosil qilingan `index.html`ni qo‘lda tahrirlamang. Komponentlar `src/` ichida qoladi.

Yangilash tartibi:

1. Manba o‘zgarishlarini commit qiling.
2. `npm run deploy:pages` buyrug‘ini bajaring.
3. GitHub’dagi **Actions → pages build and deployment** nashrini tekshiring.

Buyruq yangi yig‘ish va bitta HTML eksportini yaratadi, faqat hosil qilingan HTML fayllarini zarur bo‘lsa commit qiladi va mavjud Pages manba tarmog‘ini yangilaydi. Boshqa manba o‘zgarishlari commit qilinmagan bo‘lsa nashrni to‘xtatadi; kuch bilan yozish ishlatilmaydi. GitHub’ga yozish huquqi kerak.

Muqobil `gh-pages` tarmog‘iga ham tayyor yig‘ish joylashtirilgan, lekin mavjud Pages manbasi yuqoridagi `codex/cyber-university-seminar` tarmog‘idir.

`tests/pages.spec.js` yig‘ilgan saytni aynan `/tanaffus/` ichida ochib, 14 slayd, aktivlar, mobil navigatsiya, vazifa–taqvim bog‘lanishi, QR, bitta HTML eksporti va GitHub’da bevosita xizmat qilinadigan ildiz HTML faylini tekshiradi.

Taqdimot va qo‘llanmaning yuklab olinadigan PDF nusxalarini yangi QR manzili bilan qayta yaratish uchun `npm run export:materials` ishlatiladi. Bu buyruq Chromium va Python/PyMuPDF talab qiladi; natijalar `downloads/` ichiga yoziladi. Saytning o‘zi PDF eksporti uchun server yoki ushbu vositalarni talab qilmaydi — foydalanuvchi brauzerning chop etish dialogidan foydalanadi.

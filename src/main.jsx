import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Mail,
  CalendarDays,
  Check,
  CheckCheck,
  CheckSquare,
  Clock,
  ShieldCheck,
  BookOpen,
  Presentation,
  Mic,
  Maximize,
  Minimize,
  Grid2X2,
  Download,
  Printer,
  Plus,
  X,
  Search,
  Star,
  Archive,
  RotateCcw,
  FileText,
  Link as LinkIcon,
  Send,
  TriangleAlert,
  Menu,
  Play,
  Pause,
  GraduationCap,
  Target,
  Bell,
  Trash2,
  Pencil,
  CheckCircle2,
  Info,
} from "lucide-react";
import QRCode from "qrcode";
import { CONFIG } from "./config";
import {
  sections,
  explanations,
  matrix,
  security,
  clues,
  taskSteps,
  takeaways,
  plans,
  liveChecklist,
  slideNotes,
} from "./data";
import { Provider, useDemo, initialState } from "./state";
import "@fontsource-variable/inter";
import "./styles.css";
const pad = (n) => String(n).padStart(2, "0");
const href = (mode, id = 1) => `#/${mode}/${id}`;
function parseRoute() {
  const [mode, id] = location.hash.replace(/^#\/?/, "").split("/");
  if (["oqish", "taqdimot"].includes(mode))
    return { mode, id: Math.min(14, Math.max(1, parseInt(id) || 1)) };
  if (["maruzachi", "qollanma", "hujjat", "maruzachi-chop"].includes(mode))
    return { mode, id: 1 };
  if (!location.hash) {
    try {
      const last = Number(localStorage.getItem("cyber-last-section"));
      if (Number.isInteger(last) && last >= 1 && last <= 14)
        return { mode: "oqish", id: last };
    } catch {}
  }
  return { mode: "oqish", id: 1 };
}
function go(mode, id = 1) {
  location.hash = href(mode, id);
}
function QR({ small = false }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    QRCode.toDataURL(CONFIG.publicUrl, {
      width: small ? 144 : 280,
      margin: 4,
      color: { dark: "#071326", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setUrl)
      .catch(() => setUrl(""));
  }, [small]);
  return url ? (
    <img
      className={`qr ${small ? "small" : ""}`}
      src={url}
      width={small ? 104 : 208}
      height={small ? 104 : 208}
      alt="O‘qish ko‘rinishini ochish uchun QR kod"
      data-qr-url={CONFIG.publicUrl}
    />
  ) : (
    <span>QR tayyorlanmoqda. Quyidagi havoladan foydalaning.</span>
  );
}
function Brand({ light = false }) {
  return (
    <a
      href={href("oqish", 1)}
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Cyber University — bosh sahifa"
    >
      <span className="brand-symbol">
        <GraduationCap size={25} />
      </span>
      <span>
        CYBER<span className="brand-university">UNIVERSITY</span>
      </span>
    </a>
  );
}
function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef();
  const returnFocus = useRef(document.activeElement);
  useEffect(() => {
    const d = ref.current;
    d.showModal();
    return () => {
      d.close();
      const el = returnFocus.current;
      if (el?.isConnected) el.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-top">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Oynani yopish"
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Workflow({ compact = false }) {
  const items = [
    [Mail, "ELEKTRON XAT", "Nima so‘ralganini tushuning"],
    [CheckSquare, "VAZIFA", "Aniq ish va muddatni belgilang"],
    [CalendarDays, "TAQVIM", "Bajarish uchun vaqt ajrating"],
    [CheckCheck, "NATIJA", "Ishni yakunlang va javob yuboring"],
  ];
  return (
    <div className={`workflow ${compact ? "compact" : ""}`}>
      {items.map(([Icon, label, sub], i) => (
        <React.Fragment key={label}>
          <div className={`workflow-item stage-${i}`}>
            <span className="workflow-icon">
              <Icon />
            </span>
            <b>{label}</b>
            <span>{sub}</span>
          </div>
          {i < 3 && <ArrowRight className="flow-arrow" />}
        </React.Fragment>
      ))}
    </div>
  );
}
function SimulationLabel() {
  return (
    <div className="simulation-label">
      <span className="status-dot" /> O‘quv simulyatsiyasi — haqiqiy pochta
      hisobiga ulanmagan.
    </div>
  );
}
function SampleLink() {
  return (
    <a
      className="text-link"
      href={href("hujjat")}
      target="_blank"
      rel="noopener"
    >
      <FileText size={18} /> Hisobot shakli <ArrowUpRight size={16} />
    </a>
  );
}
function Intro() {
  return (
    <div className="intro-layout">
      <div className="intro-copy">
        <div className="eyebrow">
          <span className="tiny-line" /> AMALIY SEMINAR{" "}
          <span className="eyebrow-divider">/</span> 30 DAQIQA
        </div>
        <h1>
          Raqamli ish faoliyatini <span>rejalashtirish</span> va korporativ
          elektron pochta bilan ishlash
        </h1>
        <p className="intro-sub">
          Professor-o‘qituvchilar va xodimlar uchun amaliy seminar
        </p>
        <div className="presenter-line">
          <div className="avatar">
            {CONFIG.presenter
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </div>
          <div>
            <b>{CONFIG.presenter}</b>
            <span>{CONFIG.role}</span>
            {CONFIG.seminarDate && <span>{CONFIG.seminarDate}</span>}
          </div>
        </div>
      </div>
      <div className="intro-visual">
        <div className="visual-top">
          <span className="status-dot" /> TARTIBLI ISH. ANIQ NATIJA.
          <span className="visual-dots">•••</span>
        </div>
        <div className="visual-path" />
        <div className="visual-card mail-card">
          <span className="tile-icon cyan">
            <Mail />
          </span>
          <div>
            <small>01 / ELEKTRON XAT</small>
            <b>Yangi topshiriq keldi</b>
            <span>Oktabr hisoboti · 30-oktabr</span>
          </div>
          <span className="unread-dot" />
        </div>
        <div className="visual-card task-card">
          <span className="tile-icon blue">
            <CheckSquare />
          </span>
          <div>
            <small>02 / VAZIFA</small>
            <b>Hisobotni tayyorlash</b>
            <span>Aniq vazifa va muddat</span>
          </div>
          <Check className="card-check" />
        </div>
        <div className="visual-card calendar-card">
          <span className="tile-icon violet">
            <CalendarDays />
          </span>
          <div>
            <small>03 / TAQVIM</small>
            <b>Diqqat uchun vaqt</b>
            <span>29-oktabr · 14:00–14:45</span>
          </div>
          <span className="mini-calendar">29</span>
        </div>
        <div className="visual-result">
          <span>
            <CheckCheck size={20} />
          </span>{" "}
          NATIJA TAYYOR <i>04</i>
        </div>
        <div className="visual-note">Sanalar — o‘quv misoli</div>
      </div>
      <div className="opening-question">
        <span className="question-symbol">?</span>
        <div>
          <small>O‘YLAB KO‘RING</small>
          <p>
            Elektron xat orqali kelgan topshiriq bajarilguncha uni qanday
            kuzatib borasiz?
          </p>
        </div>
        <ArrowUpRight />
      </div>
    </div>
  );
}
function Problem() {
  return (
    <>
      <div className="problem-grid">
        {[
          "Muhim xat yozishmalar orasida yo‘qoladi.",
          "Topshirish muddati unutiladi.",
          "Vazifalar turli joylarda saqlanadi.",
          "Bajarilgan ishga javob berish kechikadi.",
        ].map((s, i) => {
          const Icon = [Mail, Clock, Grid2X2, Send][i];
          return (
            <div className="content-card problem-card" key={s}>
              <span className="card-index">0{i + 1}</span>
              <Icon />
              <h3>{s}</h3>
            </div>
          );
        })}
      </div>
      <div className="callout">
        <Target />
        <p>Tartibli tizim ishlarni kuzatishni osonlashtiradi.</p>
      </div>
    </>
  );
}
function CoreFlow() {
  return (
    <>
      <Workflow />
      <div className="content-card report-example">
        <div className="tile-icon cyan">
          <FileText />
        </div>
        <div>
          <span className="eyebrow">BITTA MISOL, BUTUN JARAYON</span>
          <h3>Oktabr hisobotini tayyorlash</h3>
          <p>
            So‘rovni o‘qing → vazifa va muddatni yozing → 45 daqiqa ajrating →
            hisobotni tayyorlab, javob bering.
          </p>
          <small>
            O‘quv misoli: muddat 30-oktabr, 16:00; ish vaqti 29-oktabr,
            14:00–14:45.
          </small>
        </div>
      </div>
    </>
  );
}
function Priority() {
  const { state, setState } = useDemo();
  return (
    <div className="matrix-layout">
      <div>
        <div className="matrix-axis">↑ MUHIMLIK</div>
        <div className="matrix-grid">
          {matrix.map((m, i) => (
            <button
              className={`quadrant ${m.tone} ${state.matrix === i ? "selected" : ""}`}
              key={m.title}
              onClick={() => setState((s) => ({ ...s, matrix: i }))}
              aria-pressed={state.matrix === i}
            >
              <span>0{i + 1}</span>
              <h3>{m.title}</h3>
              <p>{m.action}</p>
              {state.matrix === i && (
                <CheckCircle2 className="selected-check" size={20} />
              )}
            </button>
          ))}
        </div>
        <div className="matrix-axis right">SHOSHILINCHLIK →</div>
      </div>
      <div className="content-card matrix-detail" aria-live="polite">
        <span className="eyebrow">TANLANGAN HOLAT</span>
        <span className={`tile-icon ${matrix[state.matrix].tone}`}>
          <Target />
        </span>
        <h3>{matrix[state.matrix].action}</h3>
        <p>{matrix[state.matrix].example}</p>
        <small>Katakni bosing yoki Tab va Enter bilan tanlang.</small>
      </div>
    </div>
  );
}
const toISO = (d) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
function plusDays(date, n) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}
function weekOf(date) {
  const d = new Date(date + "T12:00:00Z");
  return plusDays(date, -((d.getUTCDay() + 6) % 7));
}
const dateLabel = (date) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("uz-Latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
function eventDate(e, day) {
  if (e.date === day) return true;
  const n = Math.round(
    (new Date(day + "T12:00Z") - new Date(e.date + "T12:00Z")) / 86400000,
  );
  return e.repeat === "weekly" && n > 0 && n <= 49 && n % 7 === 0;
}
function EventForm({ event, onClose, onSaved }) {
  const { setState, setNotice } = useDemo();
  const [form, setForm] = useState(
    event || {
      title: "",
      date: "2026-10-29",
      start: "14:00",
      end: "14:45",
      repeat: "none",
      reminder: "15",
      participant: "",
      meeting: false,
    },
  );
  const [errors, setErrors] = useState({});
  function field(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((s) => ({ ...s, [key]: "" }));
  }
  function submit(e) {
    e.preventDefault();
    let err = {};
    if (!form.title.trim()) err.title = "Tadbir nomini kiriting.";
    if (!form.date) err.date = "Sanani tanlang.";
    if (!form.start || !form.end || form.end <= form.start)
      err.end = "Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak.";
    if (
      form.participant &&
      !/^[^@\s]+@example\.(com|invalid)$/.test(form.participant)
    )
      err.participant =
        "Faqat example.com yoki example.invalid dagi namuna manzilini kiriting.";
    setErrors(err);
    if (Object.keys(err).length) return;
    const saved = {
      ...form,
      title: form.title.trim(),
      id:
        event?.id ||
        `event-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`,
    };
    setState((s) => ({
      ...s,
      events: event
        ? s.events.map((e) => (e.id === event.id ? saved : e))
        : [...s.events, saved],
    }));
    onSaved(saved.date);
    setNotice(
      event
        ? "Tadbir shu qurilmadagi taqvimda yangilandi."
        : "Tadbir shu qurilmadagi taqvimga qo‘shildi. Taklif yoki bildirishnoma yuborilmadi.",
    );
    onClose();
  }
  const input = (key, label, type = "text") => (
    <label>
      {label}
      <input
        type={type}
        aria-label={label}
        aria-required={key === "title" || key === "date"}
        value={form[key]}
        onChange={(e) => field(key, e.target.value)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `error-${key}` : undefined}
      />
      {errors[key] && (
        <span role="alert" className="field-error" id={`error-${key}`}>
          {errors[key]}
        </span>
      )}
    </label>
  );
  return (
    <Modal
      title={event ? "Tadbirni tahrirlash" : "Yangi tadbir"}
      onClose={onClose}
    >
      <form noValidate onSubmit={submit} className="event-form">
        <p className="muted small-text">
          Mahalliy o‘quv taqvimi. Hech kimga taklif yuborilmaydi.
        </p>
        {input("title", "Tadbir nomi")}
        {input("date", "Sana", "date")}
        <div className="form-row">
          {input("start", "Boshlanish vaqti", "time")}
          {input("end", "Tugash vaqti", "time")}
        </div>
        <div className="form-row">
          <label>
            Takrorlash
            <select
              aria-label="Takrorlash"
              value={form.repeat}
              onChange={(e) => field("repeat", e.target.value)}
            >
              <option value="none">Takrorlanmaydi</option>
              <option value="weekly">Har hafta — 8 hafta</option>
            </select>
          </label>
          <label>
            Eslatma
            <select
              aria-label="Eslatma"
              value={form.reminder}
              onChange={(e) => field("reminder", e.target.value)}
            >
              <option value="15">15 daqiqa oldin (namuna)</option>
              <option value="none">Eslatmasiz</option>
            </select>
          </label>
        </div>
        {input("participant", "Namuna ishtirokchi manzili", "email")}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.meeting}
            onChange={(e) => field("meeting", e.target.checked)}
          />{" "}
          Uchrashuv havolasi namunasini qo‘shish
        </label>
        {form.meeting && (
          <div className="example-url">
            https://meeting.example.invalid/kafedra
            <br />
            <small>
              Bosilmaydigan o‘quv namunasi — haqiqiy uchrashuv emas.
            </small>
          </div>
        )}
        {event?.taskId && (
          <div className="info-note">
            Hisobot vazifasi bilan bog‘langan tadbir.
          </div>
        )}
        <div className="modal-actions">
          {event && (
            <button
              type="button"
              className="button danger"
              onClick={() => {
                setState((s) => ({
                  ...s,
                  events: s.events.filter((e) => e.id !== event.id),
                }));
                setNotice(
                  "Tadbir va uning takroriy nusxalari mahalliy taqvimdan o‘chirildi.",
                );
                onClose();
              }}
            >
              <Trash2 size={17} /> O‘chirish
            </button>
          )}
          <button type="button" className="button secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="button primary" type="submit">
            <Check size={18} /> Saqlash
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Calendar() {
  const { state, setState, setNotice } = useDemo();
  const [week, setWeek] = useState("2026-10-26");
  const [form, setForm] = useState(null);
  const [reset, setReset] = useState(false);
  const [dayList, setDayList] = useState(null);
  const days = Array.from({ length: 7 }, (_, i) => plusDays(week, i));
  return (
    <div className="calendar-sim">
      <SimulationLabel />
      <div className="sim-toolbar">
        <div className="week-control">
          <button
            className="icon-button"
            aria-label="Oldingi hafta"
            onClick={() => setWeek(plusDays(week, -7))}
          >
            <ChevronLeft />
          </button>
          <strong>
            {dateLabel(week)} —{" "}
            {new Date(days[6] + "T12:00Z").toLocaleDateString("uz-Latn", {
              day: "numeric",
              month: "long",
              timeZone: "UTC",
            })}
          </strong>
          <button
            className="icon-button"
            aria-label="Keyingi hafta"
            onClick={() => setWeek(plusDays(week, 7))}
          >
            <ChevronRight />
          </button>
        </div>
        <button className="button primary" onClick={() => setForm({})}>
          <Plus size={18} /> Yangi tadbir
        </button>
      </div>
      <div className="week-grid">
        {days.map((day, i) => (
          <div
            className={`calendar-day ${i === 3 ? "highlight-day" : ""}`}
            key={day}
          >
            <div className="day-head">
              <span>
                {["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"][i]}
              </span>
              <b>{new Date(day + "T12:00Z").getUTCDate()}</b>
            </div>
            <div className="day-events">
              {state.events
                .filter((e) => eventDate(e, day))
                .sort((a, b) => a.start.localeCompare(b.start))
                .slice(0, 2)
                .map((e) => (
                  <button
                    className={`calendar-event ${e.taskId ? "task-event" : ""}`}
                    key={e.id}
                    onClick={() => setForm({ event: e })}
                    aria-label={`${e.title}, ${day}, ${e.start}–${e.end}, tahrirlash`}
                  >
                    <span>
                      {e.start}–{e.end}
                    </span>
                    <b>{e.title}</b>
                    {e.repeat === "weekly" && <small>↻ Har hafta</small>}
                    {e.taskId && (
                      <small>
                        {state.tasks.find((t) => t.id === e.taskId)?.done
                          ? "✓ Bajarildi"
                          : "Vazifaga bog‘langan"}
                      </small>
                    )}
                  </button>
                ))}
              {state.events.filter((e) => eventDate(e, day)).length > 2 && (
                <button className="more-events" onClick={() => setDayList(day)}>
                  Yana{" "}
                  {state.events.filter((e) => eventDate(e, day)).length - 2} ta
                  tadbir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="sim-footer">
        <button
          className="text-link"
          onClick={() =>
            setNotice(
              "Namuna: yig‘ilishga 15 daqiqa qoldi. Bu tugma orqali ko‘rsatilgan namuna; fon bildirishnomasi rejalashtirilmagan.",
            )
          }
        >
          <Bell size={17} /> Eslatma namunasi
        </button>
        <button className="text-link muted" onClick={() => setReset(true)}>
          <RotateCcw size={16} /> Boshlang‘ich holatga qaytarish
        </button>
      </div>
      <div className="info-note">
        Sanalar — o‘quv misoli. Haftalik takrorlash: 8 hafta. Eslatma faqat
        tugma bosilganda ko‘rsatiladi.
      </div>
      {form && (
        <EventForm
          event={form.event}
          onClose={() => setForm(null)}
          onSaved={(date) => setWeek(weekOf(date))}
        />
      )}{" "}
      {reset && (
        <Modal title="Taqvimni tiklash?" onClose={() => setReset(false)}>
          <p>
            Faqat taqvim tadbirlari boshlang‘ich holatga qaytadi. Vazifalar va
            xatlar saqlanadi; vazifaga bog‘langan ish vaqti ham o‘chadi.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setReset(false)}
            >
              Bekor qilish
            </button>
            <button
              className="button primary"
              onClick={() => {
                setState((s) => ({ ...s, events: initialState().events }));
                setWeek("2026-10-26");
                setReset(false);
                setNotice(
                  "Taqvim boshlang‘ich holatga qaytarildi. Xatlar va vazifalar saqlandi.",
                );
              }}
            >
              Taqvimni tiklash
            </button>
          </div>
        </Modal>
      )}
      {dayList && (
        <Modal
          title={`${dateLabel(dayList)} — barcha tadbirlar`}
          onClose={() => setDayList(null)}
        >
          <div className="all-day-events">
            {state.events
              .filter((e) => eventDate(e, dayList))
              .sort((a, b) => a.start.localeCompare(b.start))
              .map((e) => (
                <button
                  className="button secondary"
                  key={e.id}
                  onClick={() => {
                    setDayList(null);
                    setForm({ event: e });
                  }}
                >
                  {e.start}–{e.end} · {e.title}
                  <Pencil size={16} />
                </button>
              ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
function Corporate() {
  return (
    <>
      <div className="corporate-address">
        <span className="tile-icon cyan">
          <Mail />
        </span>
        <div>
          <small>UNIVERSITET KORPORATIV POCHTASI</small>
          <a
            href="https://mail.csu.uz"
            target="_blank"
            rel="noopener noreferrer"
          >
            mail.csu.uz <ArrowUpRight />
          </a>
        </div>
        <ShieldCheck className="address-shield" />
      </div>
      <div className="four-principles">
        {["Rasmiylik", "Aniqlik", "Mas’uliyat", "Xavfsizlik"].map((s, i) => (
          <div className="content-card" key={s}>
            <span>0{i + 1}</span>
            <h3>{s}</h3>
          </div>
        ))}
      </div>
      <div className="callout">
        <ShieldCheck />
        <p>
          Korporativ pochta imkoniyatlari universitetdagi tizim va administrator
          sozlamalariga bog‘liq.
        </p>
      </div>
      <p className="small-text muted">
        Amaliy namoyishda Gmail va Google xizmatlari misol sifatida ishlatilishi
        mumkin. Universitet pochtasining provayderi va integratsiyalari
        tasdiqlanmagan.
      </p>
    </>
  );
}
function Professional() {
  return (
    <>
      <div className="email-comparison">
        <div className="content-card weak-email">
          <div className="comparison-label">
            <X size={18} /> NOANIQ XAT
          </div>
          <h3>Mavzu: Hujjat</h3>
          <p>Assalomu alaykum. Hujjatni yuboring. Tezroq kerak.</p>
          <div className="weak-questions">
            Qaysi hujjat? Qachongacha? Qaysi shaklda?
          </div>
        </div>
        <div className="content-card good-email">
          <div className="comparison-label">
            <Check size={18} /> ANIQ VA PROFESSIONAL
          </div>
          <h3>Mavzu: Oktabr hisoboti | Muddat: 30-oktabr, 16:00</h3>
          <p>Assalomu alaykum, hurmatli hamkasblar!</p>
          <p>
            Oktabr oyi faoliyati bo‘yicha hisobotni 30-oktabr kuni soat 16:00
            gacha yuborishingizni so‘raymiz.
          </p>
          <p>
            Hisobot shakli quyidagi havolada keltirilgan. Hujjatni ochish uchun
            tegishli ruxsat berilganini tekshiring.
          </p>
          <SampleLink />
          <p>
            Hurmat bilan,
            <br />
            Kafedra mas’uli
          </p>
        </div>
      </div>
      <div className="email-checks">
        {[
          "Aniq mavzu",
          "Tushunarli topshiriq",
          "Belgilangan muddat",
          "Hujjat yoki havola",
          "Professional yakun",
        ].map((s) => (
          <span key={s}>
            <Check size={16} />
            {s}
          </span>
        ))}
      </div>
      <p className="info-note">
        Havola orqali ulashilgan hujjat va xatga fayl sifatida biriktirilgan
        nusxa bir xil emas. Havoladagi ruxsatlarni alohida tekshiring.
      </p>
    </>
  );
}
function Recipients() {
  const { state, setState } = useDemo();
  return (
    <div className="recipient-layout">
      <div>
        <div className="recipient-defs">
          {[
            ["To", "Asosiy qabul qiluvchi."],
            [
              "Cc",
              "Xabardor bo‘lishi kerak bo‘lgan qo‘shimcha qabul qiluvchi.",
            ],
            [
              "Bcc",
              "Manzili boshqa qabul qiluvchilarga ko‘rsatilmaydigan qabul qiluvchi.",
            ],
          ].map(([a, b]) => (
            <div key={a}>
              <b>{a}</b>
              <p>{b}</p>
            </div>
          ))}
        </div>
        <div className="reply-defs">
          <p>
            <b>Reply</b> — yuboruvchiga javob.
          </p>
          <p>
            <b>Reply all</b> — ko‘rsatilgan tegishli qabul qiluvchilarga javob.
          </p>
          <p>
            <b>Forward</b> — xatni boshqa shaxsga yo‘naltirish.
          </p>
        </div>
        <p className="info-note amber-note">
          Bcc xat mazmunini maxfiylashtirmaydi va uni boshqa joyga yuborishni
          to‘xtatmaydi.
        </p>
      </div>
      <div className="content-card recipient-exercise">
        <span className="eyebrow">QISQA MASHQ</span>
        <h3>Kimga, qaysi maydon?</h3>
        <p>
          Kafedra mudiriga xat yuborasiz. Kotibiyat ham xabardor bo‘lishi kerak.
        </p>
        {[
          ["mudir", "Kafedra mudiri", "To"],
          ["kotibiyat", "Kotibiyat", "Cc"],
        ].map(([id, label, correct]) => (
          <fieldset key={id}>
            <legend>{label}</legend>
            <div className="choice-row">
              {["To", "Cc", "Bcc"].map((v) => (
                <button
                  key={v}
                  className={`choice ${state.recipients[id] === v ? "active" : ""}`}
                  aria-pressed={state.recipients[id] === v}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      recipients: { ...s.recipients, [id]: v },
                    }))
                  }
                >
                  {v}
                </button>
              ))}
            </div>
            {state.recipients[id] && (
              <p
                className={`feedback ${state.recipients[id] === correct ? "success" : "warning"}`}
                role="status"
              >
                {state.recipients[id] === correct
                  ? `To‘g‘ri. ${label} ${correct === "To" ? "asosiy qabul qiluvchi — To." : "xabardor bo‘lishi kerak — Cc."}`
                  : `Bu vaziyatda ${correct} kerak: ${label.toLowerCase()} ${correct === "To" ? "asosiy qabul qiluvchi." : "xabardor qilinadi; manzilni yashirish zarurati yo‘q."}`}
              </p>
            )}
          </fieldset>
        ))}
        <button
          className="text-link muted"
          onClick={() => setState((s) => ({ ...s, recipients: {} }))}
        >
          <RotateCcw size={16} /> Faqat ushbu mashqni tiklash
        </button>
      </div>
    </div>
  );
}
function Inbox() {
  const { state, updateMessage, createTask, setNotice } = useDemo();
  const [query, setQuery] = useState("");
  const [archived, setArchived] = useState(false);
  const [opened, setOpened] = useState(null);
  const messages = state.messages.filter(
    (m) =>
      m.archived === archived &&
      `${m.sender} ${m.email} ${m.subject} ${m.body}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  const message = state.messages.find((m) => m.id === opened);
  const task = state.tasks.find((t) => t.messageId === "report");
  return (
    <div className="inbox-sim">
      <SimulationLabel />
      <div className="sim-toolbar">
        <div className="inbox-tabs">
          <button
            className={!archived ? "active" : ""}
            onClick={() => setArchived(false)}
          >
            Kiruvchi{" "}
            <span>{state.messages.filter((m) => !m.archived).length}</span>
          </button>
          <button
            className={archived ? "active" : ""}
            onClick={() => setArchived(true)}
          >
            Arxiv <span>{state.messages.filter((m) => m.archived).length}</span>
          </button>
        </div>
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Xatlardan qidirish"
            placeholder="Xatlardan qidirish…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Qidiruvni tozalash"
              onClick={() => setQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </label>
      </div>
      <div className="message-list">
        {messages.length === 0 && (
          <div className="empty-state">
            <Search />
            <p>
              {query
                ? "Qidiruvga mos xat topilmadi."
                : "Bu ko‘rinishda xatlar yo‘q."}
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div
            className={`message-row ${m.id === "suspicious" ? "suspicious-row" : ""}`}
            key={m.id}
          >
            <button
              className={`icon-button star-button ${m.star ? "starred" : ""}`}
              aria-label={`${m.subject}: ${m.star ? "yulduzni olib tashlash" : "yulduz belgilash"}`}
              aria-pressed={m.star}
              onClick={() => updateMessage(m.id, { star: !m.star })}
            >
              <Star size={19} fill={m.star ? "currentColor" : "none"} />
            </button>
            <button className="message-open" onClick={() => setOpened(m.id)}>
              <span className="sender-avatar">{m.sender[0]}</span>
              <span className="message-summary">
                <b>{m.sender}</b>
                <span>{m.subject}</span>
              </span>
              {m.id === "report" && task && (
                <span className={`tag ${task.done ? "green" : ""}`}>
                  {task.done ? "Bajarildi" : "Vazifa mavjud"}
                </span>
              )}
            </button>
            <select
              className="category-select"
              aria-label={`${m.subject}: toifa`}
              value={m.category}
              onChange={(e) =>
                updateMessage(m.id, { category: e.target.value })
              }
            >
              {[
                "Ish",
                "Uchrashuv",
                "Ilmiy",
                "Ta’lim",
                "Axborot",
                "Tekshirish",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              className="icon-button"
              aria-label={`${m.subject}: ${m.archived ? "arxivdan qaytarish" : "arxivlash"}`}
              onClick={() => {
                updateMessage(m.id, { archived: !m.archived });
                setNotice(
                  m.archived
                    ? "Xat kiruvchi qutiga qaytarildi."
                    : "Xat arxivlandi, o‘chirilmagan. Uni Arxiv bo‘limida topasiz.",
                );
              }}
            >
              {m.archived ? <RotateCcw size={19} /> : <Archive size={19} />}
            </button>
          </div>
        ))}
      </div>
      <p className="info-note">
        Arxivlash xatni o‘chirmaydi. Hisobotni oching va keyingi amalni
        belgilang.
      </p>
      {message && (
        <Modal title={message.subject} wide onClose={() => setOpened(null)}>
          <div className="opened-message">
            <div className="message-meta">
              <b>{message.sender}</b>
              <span>&lt;{message.email}&gt;</span>
              <span>Qabul qiluvchi: o‘qituvchi@example.com</span>
            </div>
            <p>{message.body}</p>
            {message.id === "report" && <SampleLink />}
            {message.id === "suspicious" && (
              <div className="info-note amber-note">
                Ataylab yaratilgan o‘quv namunasi.{" "}
                <a href={href("oqish", 12)} onClick={() => setOpened(null)}>
                  12-bo‘limdagi belgilarni tekshiring →
                </a>
              </div>
            )}
            <div className="modal-actions">
              {message.id === "report" && (
                <>
                  <button className="button primary" onClick={createTask}>
                    <CheckSquare size={18} />
                    {task
                      ? "Mavjud vazifani tekshirish"
                      : "Vazifaga aylantirish"}
                  </button>
                  <a
                    className="button secondary"
                    href={href("oqish", 10)}
                    onClick={() => setOpened(null)}
                  >
                    Vazifani ochish <ArrowRight size={17} />
                  </a>
                </>
              )}
              <button
                className="button secondary"
                onClick={() => {
                  updateMessage(message.id, { archived: !message.archived });
                  setNotice(
                    message.archived
                      ? "Xat kiruvchi qutiga qaytarildi."
                      : "Xat arxivlandi; u o‘chirilmagan.",
                  );
                  setOpened(null);
                }}
              >
                <Archive size={17} />
                {message.archived ? "Arxivdan qaytarish" : "Arxivlash"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Task() {
  const { state, setState, createTask, patchTask, setNotice } = useDemo();
  const task = state.tasks.find((t) => t.messageId === "report");
  const event = state.events.find((e) => e.taskId === "task-report");
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState("");
  function schedule() {
    if (event) {
      setNotice(
        "Bu vazifa uchun ish vaqti allaqachon ajratilgan. Uni 05-bo‘limda tahrirlang.",
      );
      return;
    }
    setState((s) => ({
      ...s,
      events: [
        ...s.events,
        {
          id: "event-task-report",
          taskId: "task-report",
          title: "Oktabr hisobotini tayyorlash",
          date: "2026-10-29",
          start: "14:00",
          end: "14:45",
          repeat: "none",
          reminder: "15",
          participant: "",
          meeting: false,
        },
      ],
    }));
    setNotice(
      "29-oktabr, 14:00–14:45 uchun vazifaga bog‘langan ish vaqti taqvimga qo‘shildi.",
    );
  }
  return (
    <div className="task-layout">
      <ol className="task-steps">
        {taskSteps.map((s, i) => (
          <li key={s}>
            <span>{pad(i + 1)}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="content-card task-panel">
        <div className="task-header">
          <span className="tile-icon blue">
            <CheckSquare />
          </span>
          <span className={`tag ${task?.done ? "green" : ""}`}>
            {task?.done
              ? "✓ Bajarildi"
              : task
                ? "Jarayonda"
                : "Boshlashga tayyor"}
          </span>
        </div>
        <h3>Oktabr hisobotini tayyorlash</h3>
        <p className="muted small-text">
          Manba: 09-bo‘limdagi hisobot xati. Sanalar — o‘quv misoli, 2026-yil.
        </p>
        {!task ? (
          <>
            <div className="deadline">
              <Clock size={18} />
              <span>
                Topshirish muddati<b>30-oktabr, 16:00</b>
              </span>
            </div>
            <button className="button primary" onClick={createTask}>
              <Plus size={18} /> Hisobotdan vazifa yaratish
            </button>
          </>
        ) : (
          <>
            <div className="task-dates">
              <div>
                <small>TOPSHIRISH MUDDATI</small>
                <b>30-oktabr, 16:00</b>
              </div>
              <div>
                <small>AJRATILGAN ISH VAQTI</small>
                <b>
                  {event
                    ? `${new Date(event.date + "T12:00Z").getUTCDate()}-${new Date(event.date + "T12:00Z").toLocaleDateString("uz-Latn", { month: "long", timeZone: "UTC" })}, ${event.start}–${event.end}`
                    : "Hali ajratilmagan"}
                </b>
              </div>
            </div>
            <div className="task-actions">
              <button className="button secondary" onClick={schedule}>
                <CalendarDays size={18} />
                {event ? "Ish vaqti mavjud" : "Ish vaqtini ajratish"}
              </button>
              {event && (
                <a className="text-link" href={href("oqish", 5)}>
                  Taqvimni ochish <ArrowUpRight size={16} />
                </a>
              )}
              <label className="checkbox-label result-check">
                <input
                  type="checkbox"
                  checked={!!task.result}
                  disabled={task.done}
                  onChange={(e) => patchTask({ result: e.target.checked })}
                />{" "}
                Hisobot natijasi tayyor
              </label>
              <button
                className="button secondary"
                onClick={() => {
                  setDraft(
                    task.draft ||
                      "Assalomu alaykum! Oktabr oyi faoliyati bo‘yicha hisobot tayyor. Namuna hisobot hujjati ilova qilinadi. Ruxsatlarni tekshirdim. Hurmat bilan, O‘qituvchi",
                  );
                  setDraftOpen(true);
                }}
              >
                <Pencil size={17} />
                {task.draft
                  ? "Javob loyihasini ko‘rish"
                  : "Javob loyihasini yozish"}
              </button>
              <button
                className={`button ${task.done ? "secondary" : "primary"}`}
                onClick={() => {
                  if (task.done) {
                    patchTask({ done: false });
                    setNotice("Vazifa yana “Jarayonda” holatiga qaytarildi.");
                    return;
                  }
                  if (!task.result || !task.draft) {
                    setNotice(
                      "Avval natijani tayyor deb belgilang va mahalliy javob loyihasini saqlang.",
                    );
                    return;
                  }
                  patchTask({ done: true });
                  setNotice(
                    "Vazifa “Bajarildi” deb belgilandi. Xat va taqvimdagi holat ham yangilandi.",
                  );
                }}
              >
                <CheckCheck size={18} />
                {task.done ? "Jarayonga qaytarish" : "Bajarildi deb belgilash"}
              </button>
            </div>
            {task.draft && (
              <div className="success-note">
                <CheckCircle2 size={17} /> Mahalliy javob loyihasi saqlangan.
                Xat yuborilmagan.
              </div>
            )}
          </>
        )}
      </div>
      {draftOpen && (
        <Modal
          title="Mahalliy javob loyihasi"
          onClose={() => setDraftOpen(false)}
        >
          <p className="info-note">
            Haqiqiy xat yuborilmaydi. Loyiha faqat shu qurilmada saqlanadi.
          </p>
          <label className="draft-label">
            Javob matni
            <textarea
              rows={7}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setDraftOpen(false)}
            >
              Bekor qilish
            </button>
            <button
              className="button primary"
              disabled={!draft.trim()}
              onClick={() => {
                patchTask({ draft: draft.trim() });
                setNotice(
                  "Javob loyihasi mahalliy saqlandi. Hech qanday xat yuborilmadi.",
                );
                setDraftOpen(false);
              }}
            >
              Loyihani saqlash
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Security() {
  return (
    <div className="security-layout">
      <div className="security-list">
        {security.map((s, i) => (
          <div key={s}>
            <span>{pad(i + 1)}</span>
            <p>{s}</p>
            <Check size={20} />
          </div>
        ))}
      </div>
      <div className="security-aside">
        <ShieldCheck size={72} strokeWidth={1} />
        <h3>
          Avval tekshiring.
          <br />
          Keyin harakat qiling.
        </h3>
        <p>Parol va bir martalik tasdiqlash kodini xat orqali yubormang.</p>
        <small>
          Tanish ism, HTTPS yoki to‘g‘ri grammatika xavfsizlik isboti emas.
        </small>
      </div>
    </div>
  );
}
function Phishing() {
  const { state, setState } = useDemo();
  const [active, setActive] = useState(null);
  const presenting = parseRoute().mode === "taqdimot";
  const inspect = (i) => {
    setActive(i);
    setState((s) => ({
      ...s,
      clues: s.clues.includes(i) ? s.clues : [...s.clues, i],
    }));
  };
  return (
    <div className="phishing-layout">
      <div className="content-card phishing-email">
        <div className="phish-label">
          <TriangleAlert size={18} /> Ataylab yaratilgan o‘quv namunasi
        </div>
        <div className={`phish-sender ${active === 2 ? "marked" : ""}`}>
          <small>YUBORUVCHI</small>
          <b>IT Support &lt;security-alert@example.invalid&gt;</b>
        </div>
        <div
          className={`phish-subject ${active === 0 || active === 4 ? "marked" : ""}`}
        >
          <small>MAVZU</small>
          <h3>DIQQAT! Hisobingiz 30 daqiqadan keyin bloklanadi!</h3>
        </div>
        <p className={active === 1 ? "marked" : ""}>
          Hisobingizni faol saqlab qolish uchun darhol{" "}
          <strong>parolingizni tasdiqlang.</strong>
        </p>
        <div className={`example-url ${active === 3 ? "marked" : ""}`}>
          https://account-check.example.invalid/verify
        </div>
        <small className="muted">
          Bosilmaydigan namuna manzili. Hech qanday parol kiritmang.
        </small>
      </div>
      <div className="phish-clues">
        <div className="clue-progress">
          <b>Belgilarni tekshiring</b>
          <span>{state.clues.length}/5</span>
        </div>
        {clues.map((c, i) => (
          <React.Fragment key={c.title}>
            <button
              className={`clue-button ${active === i ? "active" : ""}`}
              aria-expanded={active === i || (active === "all" && !presenting)}
              onClick={() => inspect(i)}
            >
              <span>
                {state.clues.includes(i) ? <Check size={16} /> : i + 1}
              </span>
              {c.title}
              <ChevronRight size={16} />
            </button>
            {(active === i || (active === "all" && !presenting)) && (
              <p role="status" className="clue-explanation">
                {c.text}
              </p>
            )}
          </React.Fragment>
        ))}
        <div className="clue-actions">
          <button
            className="text-link"
            onClick={() => {
              setActive("all");
              setState((s) => ({ ...s, clues: [0, 1, 2, 3, 4] }));
            }}
          >
            Barcha izohlarni ko‘rsatish
          </button>
          <button
            className="text-link muted"
            onClick={() => {
              setActive(null);
              setState((s) => ({ ...s, clues: [] }));
            }}
          >
            <RotateCcw size={16} /> Mashqni qayta boshlash
          </button>
        </div>
      </div>
      {active === "all" && presenting && (
        <Modal
          title="Barcha shubhali belgilar"
          wide
          onClose={() => setActive(null)}
        >
          <div className="all-clues">
            {clues.map((c, i) => (
              <section key={c.title}>
                <h3>
                  {i + 1}. {c.title}
                </h3>
                <p>{c.text}</p>
              </section>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
const answers = [
  [
    "A",
    "Xatni o‘qib, keyin eslashga harakat qilish.",
    "Faqat xotiraga tayanish muddat va keyingi amalni kuzatishni qiyinlashtiradi. Vazifa va ish vaqtini yozib qo‘ying.",
  ],
  [
    "B",
    "Vazifa yaratish, muddat belgilash, ish vaqtini ajratish va yakunida javob berish.",
    "To‘g‘ri. Bu yo‘l topshiriq, muddat, ish vaqti va natijani bir tizimda kuzatishga yordam beradi.",
  ],
  [
    "C",
    "Keyingi amalni belgilamasdan arxivlash.",
    "Arxiv xatni saqlaydi, ammo vazifani rejalashtirmaydi. Avval keyingi amalni belgilang.",
  ],
];
function FinalExercise() {
  const { state, setState } = useDemo();
  return (
    <>
      <div className="scenario">
        <Mail />
        <p>30-oktabr soat 16:00 gacha hisobot yuborish haqida xat keldi.</p>
        <span className="tag">O‘quv misoli</span>
      </div>
      <div className="answer-options">
        {answers.map(([letter, text, explanation]) => (
          <div key={letter}>
            <button
              className={`answer-option ${state.answer === letter ? "chosen" : ""} ${state.answer === letter && letter === "B" ? "correct" : ""}`}
              aria-pressed={state.answer === letter}
              onClick={() => setState((s) => ({ ...s, answer: letter }))}
            >
              <b>{letter}</b>
              <span>{text}</span>
              <span>
                {state.answer === letter ? <CheckCircle2 /> : <ArrowUpRight />}
              </span>
            </button>
            {state.answer === letter && (
              <div
                className={`answer-explanation ${letter === "B" ? "success" : "warning"}`}
                role="status"
              >
                {explanation}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="exercise-bottom">
        <p>Rejalashtirish ishning o‘z vaqtida bajarilishiga yordam beradi.</p>
        <button
          className="text-link muted"
          onClick={() => setState((s) => ({ ...s, answer: null }))}
        >
          <RotateCcw size={16} /> Faqat ushbu javobni tiklash
        </button>
      </div>
    </>
  );
}
function Closing() {
  return (
    <div className="closing-layout">
      <div>
        <Workflow compact />
        <div className="takeaways">
          {takeaways.map((s, i) => (
            <div key={s}>
              <span>{pad(i + 1)}</span>
              <p>{s}</p>
            </div>
          ))}
        </div>
        <h3 className="thank-you">
          Savollar? <span>E’tiboringiz uchun rahmat!</span>
        </h3>
      </div>
      <div className="qr-card">
        <span className="eyebrow">O‘RGANISHNI DAVOM ETTIRING</span>
        <QR />
        <b>Qo‘llanma doimo yoningizda</b>
        <a
          className="public-link"
          href={CONFIG.publicUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {CONFIG.publicUrl}
        </a>
        <a className="button secondary" href={href("qollanma")}>
          <Printer size={18} /> Chop etiladigan qo‘llanma
        </a>
      </div>
    </div>
  );
}
const lessons = [
  Intro,
  Problem,
  CoreFlow,
  Priority,
  Calendar,
  Corporate,
  Professional,
  Recipients,
  Inbox,
  Task,
  Security,
  Phishing,
  FinalExercise,
  Closing,
];
function Lesson({ id }) {
  const { resetGeneration } = useDemo();
  const Component = lessons[id - 1];
  return <Component key={`${id}-${resetGeneration}`} />;
}
function Overview({ onClose, mode, id }) {
  return (
    <Modal title="Seminar bo‘limlari" wide onClose={onClose}>
      <p className="muted">14 bo‘lim · 30 daqiqalik amaliy seminar</p>
      <div className="overview-grid">
        {sections.map((s) => (
          <a
            key={s.id}
            className={`overview-item ${id === s.id ? "current" : ""}`}
            href={href(mode, s.id)}
            onClick={onClose}
          >
            <span>{pad(s.id)}</span>
            <b>{s.label}</b>
            <ArrowUpRight size={17} />
          </a>
        ))}
      </div>
    </Modal>
  );
}
function Sidebar({ id }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        SEMINAR DASTURI <span>14</span>
      </div>
      <nav aria-label="Mundarija">
        {sections.map((s) => (
          <React.Fragment key={s.id}>
            {[1, 5, 11].includes(s.id) && (
              <div className="nav-group-label">
                {s.id === 1
                  ? "01 — ISHNI TIZIMLASHTIRISH"
                  : s.id === 5
                    ? "02 — AMALIY KO‘NIKMALAR"
                    : "03 — XAVFSIZLIK VA YAKUN"}
              </div>
            )}
            <a
              href={href("oqish", s.id)}
              className={`section-link ${id === s.id ? "active" : ""}`}
              aria-current={id === s.id ? "page" : undefined}
            >
              <span>{pad(s.id)}</span>
              {s.label}
              {id === s.id && <span className="nav-active-dot" />}
            </a>
          </React.Fragment>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div>
          <BookOpen size={16} />
          <span>O‘z sur’atingizda o‘rganing</span>
        </div>
        <div className="sidebar-progress">
          <span style={{ width: `${(id / 14) * 100}%` }} />
        </div>
        <small>Joriy bo‘lim: {pad(id)} / 14</small>
      </div>
    </aside>
  );
}
function Header({ mode, id, onMenu, onReset }) {
  return (
    <header className="app-header">
      <Brand />
      <nav className="mode-switch" aria-label="Ko‘rinish">
        <a
          className={mode === "oqish" ? "active" : ""}
          href={href("oqish", id)}
        >
          <BookOpen size={17} />
          <span>Mustaqil o‘rganish</span>
        </a>
        <a
          className={mode === "taqdimot" ? "active" : ""}
          href={href("taqdimot", id)}
        >
          <Presentation size={17} />
          <span>Taqdimot</span>
        </a>
        <a
          className={mode === "maruzachi" ? "active" : ""}
          href={href("maruzachi")}
        >
          <Mic size={17} />
          <span>Ma’ruzachi</span>
        </a>
      </nav>
      <div className="header-actions">
        <a
          className="handout-link"
          aria-label="Chop etiladigan qo‘llanma"
          href={href("qollanma")}
        >
          <Download size={17} />
          <span>Qo‘llanma</span>
        </a>
        <button
          className="icon-button reset-global"
          aria-label="Barcha mashqlarni tiklash"
          title="Barcha mashqlarni tiklash"
          onClick={onReset}
        >
          <RotateCcw size={18} />
        </button>
        {mode === "oqish" && (
          <button
            className="icon-button mobile-menu"
            aria-label="Bo‘limlar mundarijasini ochish"
            onClick={onMenu}
          >
            <Menu />
          </button>
        )}
      </div>
    </header>
  );
}
function Reading({ id, onOverview }) {
  const { setNotice } = useDemo();
  return (
    <div className="reading-shell">
      <Sidebar id={id} />
      <main id="main" className={`reading-main lesson-${id}`}>
        <div className="reading-breadcrumb">
          <div>
            <span>AMALIY QO‘LLANMA</span>
            <ChevronRight size={14} />
            <b>{sections[id - 1].label}</b>
          </div>
          <span className="reading-indicator">
            <span className="status-dot" /> Mustaqil o‘rganish
          </span>
        </div>
        <article id={`bolim-${id}`}>
          <div className="section-topline">
            <span className="lesson-number">
              {pad(id)} <span>/ 14</span>
            </span>
            <div>
              <button className="text-link" onClick={onOverview}>
                <Grid2X2 size={16} /> Barcha bo‘limlar
              </button>
              <a
                className="text-link open-presentation"
                href={href("taqdimot", id)}
              >
                <Presentation size={16} /> Taqdimotda ochish{" "}
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
          {id !== 1 && (
            <div className="lesson-heading">
              <span className="eyebrow">
                {sections[id - 1].label.toLocaleUpperCase()}
              </span>
              <h1>{sections[id - 1].title}</h1>
              <p>{sections[id - 1].subtitle}</p>
            </div>
          )}
          <Lesson key={id} id={id} />
          <details key={`details-${id}`} className="reading-details">
            <summary>
              <span>
                <BookOpen size={20} /> Batafsil tushuntirish
              </span>
              <Plus size={20} />
            </summary>
            <div>
              <p>{explanations[id - 1]}</p>
            </div>
          </details>
          {id === 1 && (
            <div className="learning-goals">
              <span className="eyebrow">SEMINARDAN KEYIN SIZ</span>
              <div>
                <p>
                  <CheckCircle2 /> Xatni aniq vazifaga aylantirasiz
                </p>
                <p>
                  <CheckCircle2 /> Ishga alohida vaqt ajratasiz
                </p>
                <p>
                  <CheckCircle2 /> Xavfsiz va tushunarli yozishasiz
                </p>
              </div>
            </div>
          )}
          <div className="section-resource-row">
            <button
              className="text-link muted"
              onClick={async () => {
                const url =
                  location.origin + location.pathname + href("oqish", id);
                try {
                  await navigator.clipboard.writeText(url);
                  setNotice("Ushbu bo‘lim havolasi nusxalandi.");
                } catch {
                  setNotice(`Bo‘lim havolasi: ${url}`);
                }
              }}
            >
              <LinkIcon size={16} /> Bo‘lim havolasini nusxalash
            </button>
            <a className="text-link muted" href={href("qollanma")}>
              <Printer size={16} /> Qo‘llanmani chop etish / PDF sifatida
              saqlash
            </a>
          </div>
        </article>
        <div className="reading-next">
          {id > 1 ? (
            <a className="previous-section" href={href("oqish", id - 1)}>
              <ArrowLeft size={18} />
              <span>
                <small>OLDINGI BO‘LIM</small>
                {sections[id - 2].label}
              </span>
            </a>
          ) : (
            <div className="start-note">
              <span className="status-dot" /> Bilimdan — amaliyotga
            </div>
          )}
          <a
            className="next-section"
            href={href("oqish", id === 14 ? 1 : id + 1)}
          >
            <span>
              <small>{id === 14 ? "BOSHIGA QAYTISH" : "KEYINGI BO‘LIM"}</small>
              {sections[id === 14 ? 0 : id].label}
            </span>
            <span className="next-arrow">
              <ArrowRight size={20} />
            </span>
          </a>
        </div>
        <footer className="reading-footer">
          <span>
            CYBER UNIVERSITY <i>·</i> Amaliy bilim. Tartibli ish.
          </span>
          <span>O‘quv ma’lumotlari · Mahalliy simulyatsiya</span>
        </footer>
      </main>
    </div>
  );
}
function PresentationView({ id, onOverview }) {
  const [scale, setScale] = useState(1);
  const [full, setFull] = useState(false);
  const [fallback, setFallback] = useState(false);
  const { setNotice } = useDemo();
  useEffect(() => {
    function resize() {
      setScale(
        Math.min(
          (window.innerWidth - 32) / 1440,
          (window.innerHeight - (fallback ? 73 : 150)) / 810,
        ),
      );
    }
    resize();
    window.addEventListener("resize", resize);
    document.documentElement.dataset.wide = fallback ? "true" : "false";
    return () => {
      window.removeEventListener("resize", resize);
      delete document.documentElement.dataset.wide;
    };
  }, [fallback]);
  useEffect(() => {
    const change = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
  async function fullscreen() {
    if (fallback) {
      setFallback(false);
      return;
    }
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setFull(false);
      } catch {
        setFull(false);
      }
      return;
    }
    try {
      if (!document.documentElement.requestFullscreen) throw Error();
      await document.documentElement.requestFullscreen();
      setFull(true);
    } catch {
      setFallback(true);
      setNotice(
        "Brauzer to‘liq ekranga ruxsat bermadi. Taqdimot oynaga mos keng ko‘rinishda ochiq; F11 tugmasidan ham foydalanishingiz mumkin.",
      );
    }
  }
  return (
    <main
      className={`presentation ${fallback ? "wide-fallback" : ""}`}
      id="main"
    >
      <div
        className="presentation-stage"
        style={{ width: 1440 * scale, height: 810 * scale }}
      >
        <article
          className={`slide slide-${id}`}
          style={{ transform: `scale(${scale})` }}
          aria-label={`${id}-slayd: ${sections[id - 1].label}`}
        >
          <div className="slide-brandline">
            <span>CYBER UNIVERSITY</span>
            <span>
              RAQAMLI ISH FAOLIYATI <i>/</i> AMALIY SEMINAR
            </span>
          </div>
          {id !== 1 && (
            <div className="slide-heading">
              <span className="eyebrow">
                {pad(id)} — {sections[id - 1].label.toLocaleUpperCase()}
              </span>
              <h1>{sections[id - 1].title}</h1>
            </div>
          )}
          <div className="slide-body">
            <Lesson key={id} id={id} />
          </div>
          <div className="slide-bottomline">
            <span>
              {id === 1
                ? "30 daqiqa · Professor-o‘qituvchilar va xodimlar uchun"
                : sections[id - 1].subtitle}
            </span>
            <b>
              {pad(id)} <span>/ 14</span>
            </b>
          </div>
        </article>
      </div>
      <div className="presentation-controls">
        <div className="presentation-progress" aria-label={`${id} / 14 slayd`}>
          <span style={{ width: `${(id / 14) * 100}%` }} />
        </div>
        <div className="control-left">
          <button
            className="icon-button"
            onClick={onOverview}
            aria-label="Slaydlar sharhi"
          >
            <Grid2X2 size={20} />
          </button>
          <span>
            {pad(id)} <span className="muted">/ 14</span>
          </span>
        </div>
        <div className="control-center">
          <button
            className="button secondary"
            disabled={id === 1}
            onClick={() => go("taqdimot", id - 1)}
            aria-label="Oldingi slayd"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="keyboard-hint">← → bilan boshqaring</span>
          <button
            className="button primary"
            disabled={id === 14}
            onClick={() => go("taqdimot", id + 1)}
            aria-label="Keyingi slayd"
          >
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="control-right">
          <a
            className="icon-button"
            href={href("oqish", id)}
            aria-label="Ushbu bo‘limni o‘qish ko‘rinishida ochish"
          >
            <BookOpen size={20} />
          </a>
          <button
            className="icon-button"
            onClick={fullscreen}
            aria-label={
              fallback
                ? "Keng ko‘rinishni yopish"
                : full
                  ? "To‘liq ekrandan chiqish"
                  : "To‘liq ekran"
            }
          >
            {full || fallback ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </main>
  );
}
function Timer({ timer, setTimer }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [timer.running]);
  const elapsed =
    timer.elapsed + (timer.running ? Math.max(0, now - timer.started) : 0);
  const seconds = Math.floor(elapsed / 1000);
  return (
    <div className="timer">
      <span className="eyebrow">SEMINAR TAYMERI</span>
      <div
        className={`timer-digits ${seconds >= 1800 ? "warning" : ""}`}
        role="timer"
        aria-label="Seminar o‘tgan vaqti"
      >
        {pad(Math.floor(seconds / 60))}
        <span>:</span>
        {pad(seconds % 60)}
        <small>/ 30:00</small>
      </div>
      <div className="timer-controls">
        <button
          className="button primary"
          onClick={() => {
            const time = Date.now();
            setNow(time);
            setTimer((t) =>
              t.running
                ? {
                    ...t,
                    running: false,
                    elapsed: t.elapsed + time - t.started,
                  }
                : { ...t, running: true, started: time },
            );
          }}
        >
          {timer.running ? <Pause size={17} /> : <Play size={17} />}{" "}
          {timer.running ? "Pauza" : "Boshlash"}
        </button>
        <button
          className="icon-button"
          aria-label="Taymerni nolga qaytarish"
          onClick={() => {
            setTimer({ elapsed: 0, started: 0, running: false });
            setNow(Date.now());
          }}
        >
          <RotateCcw size={19} />
        </button>
      </div>
      <small>Qo‘lda boshqariladi. Slaydlar avtomatik o‘tmaydi.</small>
    </div>
  );
}
function PlanContent() {
  return (
    <div className="plan-list">
      {plans.map((p, i) => (
        <section className="plan-card" key={p.time}>
          <div className="plan-card-header">
            <span>{p.time}</span>
            <h2>{p.title}</h2>
            <small>Bo‘limlar: {p.slides}</small>
          </div>
          <div className="plan-content">
            {[
              ["Tayyorgarlik", p.prep],
              ["Mahalliy namoyish qadamlari", p.steps],
              ["Ekranda kutiladigan natija", p.screen],
              ["Nima deyish kerak", p.say],
              ["Auditoriyaga savol", p.question],
              ["Kutiladigan o‘quv natijasi", p.outcome],
              ["Zaxira yo‘l", p.backup],
            ].map(([title, text]) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
function Notes() {
  return (
    <div className="slide-notes">
      {sections.map((s, i) => (
        <section key={s.id}>
          <span className="eyebrow">SLAYD {pad(s.id)}</span>
          <h3>{s.label}</h3>
          <p>{slideNotes[i]}</p>
          <div className="small-text muted">
            Kutiladigan ekran: {s.title}.{" "}
            {i === 11
              ? "To‘liq namunaviy xat va beshta tekshirish belgisi."
              : i === 9
                ? "Vazifa, ajratilgan vaqt va mahalliy javob loyihasi."
                : "Bo‘lim mazmuni va tegishli mashq natijasi."}
          </div>
          <a className="text-link no-print" href={href("taqdimot", s.id)}>
            Slaydni ochish <ArrowUpRight size={16} />
          </a>
        </section>
      ))}
    </div>
  );
}
function LiveGuide() {
  return (
    <section className="live-guide">
      <span className="eyebrow">IXTIYORIY GOOGLE NAMOYISHI</span>
      <h2>
        Tashqi xizmatdagi jonli namoyish — imkoniyatlar hisob va interfeysga
        bog‘liq.
      </h2>
      <p>
        Bu sayt Gmail, Google Tasks, Google Calendar, Google Docs yoki Google
        Meet hisobiga ulanmagan. mail.csu.uz bilan integratsiya tasdiqlanmagan.
        Haqiqiy namoyishni faqat kelishilgan sinov hisoblari bilan o‘tkazing;
        saytning o‘zi hech narsa yubormaydi.
      </p>
      <ol>
        {liveChecklist.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </section>
  );
}
function Presenter({ timer, setTimer, print = false }) {
  const [tab, setTab] = useState("plan");
  return (
    <main
      id="main"
      className={`presenter-page ${print ? "presenter-print-page" : ""}`}
    >
      <div className="presenter-heading">
        <div>
          <span className="eyebrow">SAHNA ORTIDAGI YORDAMCHI</span>
          <h1>Ma’ruzachi qo‘llanmasi</h1>
          <p>30 daqiqa. Asosiy e’tibor — amaliy namoyishda.</p>
        </div>
        {!print && (
          <a className="button secondary" href={href("maruzachi-chop")}>
            <Printer size={18} /> Ma’ruzachi qo‘llanmasini chop etish
          </a>
        )}
      </div>
      <div className="info-note presenter-disclaimer">
        Bu alohida ko‘rinish; autentifikatsiya bilan himoyalanmagan. Eslatmalar
        auditoriya taqdimotida ko‘rsatilmaydi.
      </div>
      {print ? (
        <>
          <div className="print-actions no-print">
            <button className="button primary" onClick={() => window.print()}>
              <Printer size={18} /> Chop etish / PDF sifatida saqlash
            </button>
            <a className="text-link" href={href("maruzachi")}>
              Ma’ruzachi ko‘rinishiga qaytish
            </a>
          </div>
          <PlanContent />
          <h2>Har bir slayd uchun eslatmalar</h2>
          <Notes />
          <LiveGuide />
        </>
      ) : (
        <div className="presenter-layout">
          <div>
            <div
              className="presenter-tabs"
              role="tablist"
              aria-label="Ma’ruzachi materiallari"
            >
              {[
                ["plan", "30 daqiqalik reja"],
                ["notes", "14 slayd eslatmalari"],
                ["live", "Jonli namoyish"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  id={`tab-${value}`}
                  role="tab"
                  aria-selected={tab === value}
                  aria-controls="presenter-tab-panel"
                  className={tab === value ? "active" : ""}
                  onClick={() => setTab(value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const values = ["plan", "notes", "live"];
                      const next =
                        values[
                          (values.indexOf(value) +
                            (e.key === "ArrowRight" ? 1 : 2)) %
                            3
                        ];
                      setTab(next);
                      document.getElementById(`tab-${next}`).focus();
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              role="tabpanel"
              id="presenter-tab-panel"
              aria-labelledby={`tab-${tab}`}
            >
              {tab === "plan" ? (
                <PlanContent />
              ) : tab === "notes" ? (
                <Notes />
              ) : (
                <LiveGuide />
              )}
            </div>
          </div>
          <aside className="presenter-aside">
            <Timer timer={timer} setTimer={setTimer} />
            <div className="content-card">
              <span className="eyebrow">NAMOYISHDAN OLDIN</span>
              <ul>
                <li>QR va o‘qish ko‘rinishini tekshiring.</li>
                <li>Mahalliy hisobot shaklini tayyorlang.</li>
                <li>
                  Mashqdagi o‘zgarishlarni saqlash yoki tiklashni tanlang.
                </li>
                <li>Qo‘llanmani oldindan chop eting.</li>
              </ul>
              <a href={href("taqdimot", 1)} className="button secondary">
                <Presentation size={18} /> Taqdimotni ochish
              </a>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
function Handout() {
  return (
    <main className="handout-page" id="main">
      <div className="print-actions no-print">
        <a className="text-link" href={href("oqish", 14)}>
          <ArrowLeft size={18} /> Seminarga qaytish
        </a>
        <button className="button primary" onClick={() => window.print()}>
          <Printer size={18} /> Chop etish / PDF sifatida saqlash
        </button>
      </div>
      <article className="handout">
        <div className="handout-header">
          <Brand light />
          <span>AMALIY QO‘LLANMA</span>
        </div>
        <h1>
          Raqamli ish faoliyati:
          <br />
          qisqa amaliy qo‘llanma
        </h1>
        <p className="handout-lead">
          Professor-o‘qituvchilar va xodimlar uchun · Cyber University
        </p>
        <div className="handout-workflow">
          ELEKTRON XAT <span>→</span> VAZIFA <span>→</span> TAQVIM{" "}
          <span>→</span> NATIJA
        </div>
        <div className="handout-columns">
          <div>
            <section>
              <h2>01 / Har kungi besh odat</h2>
              <ol>
                <li>Kunning 1–3 muhim natijasini belgilang.</li>
                <li>Har muhim xatga keyingi amal yozing.</li>
                <li>Vazifaning topshirish muddatini belgilang.</li>
                <li>Taqvimda ish uchun alohida vaqt ajrating.</li>
                <li>Kun oxirida natija va javoblarni tekshiring.</li>
              </ol>
            </section>
            <section>
              <h2>02 / Professional xat namunasi</h2>
              <div className="handout-email">
                <b>Mavzu: Oktabr hisoboti | 30-oktabr, 16:00</b>
                <p>Assalomu alaykum, hurmatli hamkasblar!</p>
                <p>
                  Oktabr faoliyati hisobotini 30-oktabr soat 16:00 gacha
                  yuborishingizni so‘raymiz. Hisobot shakli ulashilgan hujjatda.
                  Hujjatni ochish ruxsatini tekshiring.
                </p>
                <p>
                  Hurmat bilan,
                  <br />
                  Kafedra mas’uli
                </p>
              </div>
              <p className="handout-tip">
                Havola ruxsati va biriktirilgan fayl nusxasi — alohida masala.
                Sanalar o‘quv misolidir.
              </p>
            </section>
            <section>
              <h2>03 / Muddat ≠ ish vaqti</h2>
              <p>
                <b>Muddat:</b> 30-oktabr, 16:00.
                <br />
                <b>Ish vaqti:</b> 29-oktabr, 14:00–14:45.
              </p>
              <p>Yakunida natijani tekshiring va aniq javob bering.</p>
            </section>
          </div>
          <div>
            <section>
              <h2>04 / Qabul qiluvchilar</h2>
              <p>
                <b>To</b> — asosiy qabul qiluvchi.
              </p>
              <p>
                <b>Cc</b> — xabardor bo‘lishi kerak bo‘lgan qo‘shimcha qabul
                qiluvchi.
              </p>
              <p>
                <b>Bcc</b> — manzili boshqalarga ko‘rinmaydigan qabul qiluvchi.
                Mazmunni maxfiylashtirmaydi.
              </p>
            </section>
            <section>
              <h2>05 / Besh xavfsizlik qoidasi</h2>
              <ol>
                {security.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="handout-warning">
                <b>Parol va bir martalik kodni xat orqali yubormang.</b> Tanish
                ism va HTTPS — xavfsizlik kafolati emas.
              </p>
            </section>
            <section>
              <h2>06 / Korporativ pochta</h2>
              <p>
                <b>mail.csu.uz</b> imkoniyatlari universitet tizimi va
                administrator sozlamalariga bog‘liq. Google xizmatlari — alohida
                ixtiyoriy misol.
              </p>
            </section>
          </div>
        </div>
        <footer className="handout-footer">
          <div>
            <h2>Material va amaliy mashqlar</h2>
            <a href={CONFIG.publicUrl}>{CONFIG.publicUrl}</a>
            <p>
              QR kod mobil o‘qish ko‘rinishini ochadi.
              <br />
              Mashqlar — mahalliy o‘quv simulyatsiyasi.
            </p>
          </div>
          <QR small />
        </footer>
      </article>
    </main>
  );
}
function SampleDocument() {
  return (
    <main className="document-page" id="main">
      <div className="print-actions no-print">
        <a className="text-link" href={href("oqish", 7)}>
          <ArrowLeft size={18} /> Xat namunasiga qaytish
        </a>
        <button className="button primary" onClick={() => window.print()}>
          <Printer size={18} /> Chop etish / PDF sifatida saqlash
        </button>
      </div>
      <article className="sample-document">
        <span className="eyebrow">MAHALLIY O‘QUV HUJJATI</span>
        <h1>Oktabr oyi faoliyati hisoboti</h1>
        <p>
          Bu sayt ichidagi namuna. Google Docs yoki universitet hujjatlar
          tizimiga ulanmagan.
        </p>
        <div className="document-access">
          <ShieldCheck size={20} />
          <div>
            <b>Ruxsat bo‘yicha eslatma</b>
            <p>
              Haqiqiy xizmatda kim ko‘rishi yoki tahrirlashi mumkinligini
              tekshiring. Bu namuna saytdagi barcha tashrifchilarga ochiq.
            </p>
          </div>
        </div>
        <h2>Hisobot shakli</h2>
        <table>
          <thead>
            <tr>
              <th>Yo‘nalish</th>
              <th>Bajarilgan ish</th>
              <th>Natija / dalil</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>O‘quv ishlari</td>
              <td>Amaliy mashg‘ulot o‘tkazildi</td>
              <td>O‘quv materiallari tayyorlandi</td>
            </tr>
            <tr>
              <td>Ilmiy faoliyat</td>
              <td>Seminar uchun ma’ruza tayyorlandi</td>
              <td>Ma’ruza matni</td>
            </tr>
            <tr>
              <td>Tashkiliy ishlar</td>
              <td>Ish rejasi yangilandi</td>
              <td>Kelishilgan reja</td>
            </tr>
          </tbody>
        </table>
        <p>
          <b>Topshirish muddati:</b> 30-oktabr, 16:00 — o‘quv misoli.
        </p>
        <p>Mas’ul: Namuna o‘qituvchi · oqituvchi@example.com</p>
      </article>
    </main>
  );
}
function App() {
  const [route, setRoute] = useState(parseRoute);
  const [overview, setOverview] = useState(false);
  const [reset, setReset] = useState(false);
  const [timer, setTimer] = useState({
    elapsed: 0,
    started: 0,
    running: false,
  });
  const { notice, setNotice, storageWarning, resetAll } = useDemo();
  useEffect(() => {
    function change() {
      setRoute(parseRoute());
      setOverview(false);
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.mode = route.mode;
    document.title = `${route.mode === "taqdimot" ? pad(route.id) + " · " : ""}${["oqish", "taqdimot"].includes(route.mode) ? sections[route.id - 1].label : route.mode === "maruzachi" ? "Ma’ruzachi" : route.mode === "qollanma" ? "Qisqa qo‘llanma" : route.mode === "hujjat" ? "Hisobot shakli" : "Ma’ruzachi qo‘llanmasi"} · Cyber University`;
    if (route.mode === "oqish") {
      try {
        localStorage.setItem("cyber-last-section", String(route.id));
      } catch {}
    }
  }, [route]);
  useEffect(() => {
    const key = (e) => {
      if (
        route.mode !== "taqdimot" ||
        overview ||
        reset ||
        document.querySelector("dialog[open]") ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.target.closest(
          'input,textarea,select,button,a,dialog,summary,[contenteditable],[role="tab"],[role="button"]',
        )
      )
        return;
      let target;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown")
        target = Math.min(14, route.id + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp")
        target = Math.max(1, route.id - 1);
      if (e.key === "Home") target = 1;
      if (e.key === "End") target = 14;
      if (target) {
        e.preventDefault();
        go("taqdimot", target);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [route, overview, reset]);
  const standalone = ["qollanma", "hujjat", "maruzachi-chop"].includes(
    route.mode,
  );
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main");
          main.tabIndex = -1;
          main.focus();
        }}
      >
        Asosiy mazmunga o‘tish
      </a>
      {!standalone && (
        <Header
          mode={route.mode}
          id={route.id}
          onMenu={() => setOverview(true)}
          onReset={() => setReset(true)}
        />
      )}{" "}
      {route.mode === "oqish" ? (
        <Reading id={route.id} onOverview={() => setOverview(true)} />
      ) : route.mode === "taqdimot" ? (
        <PresentationView id={route.id} onOverview={() => setOverview(true)} />
      ) : route.mode === "maruzachi" ? (
        <Presenter timer={timer} setTimer={setTimer} />
      ) : route.mode === "qollanma" ? (
        <Handout />
      ) : route.mode === "hujjat" ? (
        <SampleDocument />
      ) : (
        <Presenter timer={timer} setTimer={setTimer} print />
      )}
      {overview && (
        <Overview
          mode={route.mode === "taqdimot" ? "taqdimot" : "oqish"}
          id={route.id}
          onClose={() => setOverview(false)}
        />
      )}{" "}
      {reset && (
        <Modal
          title="Barcha mashqlarni tiklash?"
          onClose={() => setReset(false)}
        >
          <p>
            Barcha xatlar, vazifalar, javob loyihalari, taqvim tadbirlari va
            mashq javoblari boshlang‘ich holatga qaytadi. Bu amal faqat shu
            qurilmadagi o‘quv ma’lumotlariga ta’sir qiladi. Taymer o‘zgarmaydi.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setReset(false)}
            >
              Bekor qilish
            </button>
            <button
              className="button danger"
              onClick={() => {
                resetAll();
                setReset(false);
                setNotice(
                  "Barcha o‘quv ma’lumotlari boshlang‘ich holatga qaytarildi.",
                );
              }}
            >
              Barchasini tiklash
            </button>
          </div>
        </Modal>
      )}
      {notice && (
        <div className="toast" role="status">
          <span className="tile-icon">
            <Info size={20} />
          </span>
          <p>{notice}</p>
          <button
            className="icon-button"
            onClick={() => setNotice("")}
            aria-label="Xabarni yopish"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {storageWarning && (
        <div className="storage-warning" role="status">
          Brauzer xotirasi mavjud emas. Mashqlar joriy ochilgan sahifada
          ishlaydi, qayta ochilganda saqlanmaydi.
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <Provider>
    <App />
  </Provider>,
);

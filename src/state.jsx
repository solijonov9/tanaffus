import React, { createContext, useContext, useState, useEffect } from "react";
import { initialMessages } from "./data";
const KEY = "cyber-seminar-demo-v1";
export const initialState = () => ({
  version: 1,
  messages: structuredClone(initialMessages),
  tasks: [],
  events: [
    {
      id: "weekly-plan",
      title: "Haftalik reja",
      date: "2026-10-26",
      start: "09:00",
      end: "09:30",
      repeat: "none",
      reminder: "15",
      participant: "",
      meeting: false,
    },
    {
      id: "department-meeting",
      title: "Kafedra yig‘ilishi",
      date: "2026-10-29",
      start: "10:00",
      end: "10:30",
      repeat: "none",
      reminder: "15",
      participant: "hamkasb@example.com",
      meeting: true,
    },
  ],
  clues: [],
  matrix: 0,
  recipients: {},
  answer: null,
});
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const s = JSON.parse(raw);
    if (
      s.version !== 1 ||
      !Array.isArray(s.messages) ||
      s.messages.length !== 6 ||
      !s.messages.every(
        (m) =>
          initialMessages.some((x) => x.id === m.id) &&
          ["sender", "email", "subject", "body", "category"].every(
            (k) => typeof m[k] === "string",
          ) &&
          typeof m.star === "boolean" &&
          typeof m.archived === "boolean",
      ) ||
      !Array.isArray(s.tasks) ||
      !s.tasks.every(
        (t) =>
          typeof t.id === "string" &&
          typeof t.title === "string" &&
          typeof t.due === "string" &&
          typeof t.done === "boolean" &&
          typeof t.draft === "string",
      ) ||
      !Array.isArray(s.events) ||
      !s.events.every(
        (e) =>
          [
            "id",
            "title",
            "date",
            "start",
            "end",
            "repeat",
            "reminder",
            "participant",
          ].every((k) => typeof e[k] === "string") &&
          /^\d{4}-\d{2}-\d{2}$/.test(e.date),
      ) ||
      !Array.isArray(s.clues) ||
      !s.clues.every((c) => Number.isInteger(c) && c >= 0 && c < 5) ||
      !Number.isInteger(s.matrix) ||
      s.matrix < 0 ||
      s.matrix > 3 ||
      !s.recipients ||
      typeof s.recipients !== "object"
    )
      return initialState();
    return s;
  } catch {
    return initialState();
  }
}
const Context = createContext();
export function Provider({ children }) {
  const [state, setState] = useState(load);
  const [resetGeneration, setResetGeneration] = useState(0);
  const [notice, setNotice] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const resetAll = () => {
    setState(initialState());
    setResetGeneration((generation) => generation + 1);
  };
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      setStorageWarning(true);
    }
  }, [state]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 6500);
    return () => clearTimeout(id);
  }, [notice]);
  const updateMessage = (id, patch) =>
    setState((s) => ({
      ...s,
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  const createTask = () => {
    const existing = state.tasks.find((t) => t.messageId === "report");
    if (existing) {
      setNotice("Bu vazifa mavjud — takroriy nusxa yaratilmadi.");
      return existing.id;
    }
    setState((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        {
          id: "task-report",
          messageId: "report",
          title: "Oktabr hisobotini tayyorlash",
          due: "2026-10-30",
          dueTime: "16:00",
          done: false,
          result: false,
          draft: "",
        },
      ],
    }));
    setNotice(
      "Hisobot xatidan bitta mahalliy vazifa yaratildi. Uni 10-bo‘limda ko‘ring.",
    );
    return "task-report";
  };
  const patchTask = (patch) =>
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === "task-report" ? { ...t, ...patch } : t,
      ),
    }));
  return (
    <Context.Provider
      value={{
        state,
        setState,
        notice,
        setNotice,
        storageWarning,
        updateMessage,
        createTask,
        patchTask,
        resetAll,
        resetGeneration,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useDemo = () => useContext(Context);

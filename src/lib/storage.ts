export type TaskKind = "email" | "research";

export type SavedItem = {
  id: string;
  kind: TaskKind;
  title: string;
  content: string;
  createdAt: string;
};

export type TaskItem = {
  id: string;
  kind: TaskKind;
  title: string;
  status: "Completed";
  createdAt: string;
};

const SAVED_KEY = "awpa.saved";
const TASKS_KEY = "awpa.tasks";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("awpa:storage"));
}

export const getSaved = () => read<SavedItem>(SAVED_KEY);
export const getTasks = () => read<TaskItem>(TASKS_KEY);

export function saveItem(item: Omit<SavedItem, "id" | "createdAt">) {
  const entry: SavedItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  write(SAVED_KEY, [entry, ...getSaved()].slice(0, 100));
  return entry;
}

export function deleteSaved(id: string) {
  write(
    SAVED_KEY,
    getSaved().filter((i) => i.id !== id),
  );
}

export function logTask(kind: TaskKind, title: string) {
  const entry: TaskItem = {
    id: crypto.randomUUID(),
    kind,
    title,
    status: "Completed",
    createdAt: new Date().toISOString(),
  };
  write(TASKS_KEY, [entry, ...getTasks()].slice(0, 25));
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
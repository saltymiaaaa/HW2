import type { Verdict } from "./types";

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB", "PB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[i]}`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30.4);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  readable: "Opens and is complete",
  lossy: "Opens, and something is missing",
  unreadable: "Does not reliably open",
  unknown: "Never checked",
};

export const VERDICT_SHORT: Record<Verdict, string> = {
  readable: "Complete",
  lossy: "Lossy",
  unreadable: "Unreadable",
  unknown: "Unchecked",
};

export function scheduleLabel(s: string): string {
  return s === "off" ? "Not scheduled" : s === "daily" ? "Every day" : s === "weekly" ? "Every week" : "Every month";
}

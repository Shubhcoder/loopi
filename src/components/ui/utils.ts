import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(
  dateStr: string,
  options?: {
    locale?: string;
    dateStyle?: "short" | "medium" | "long" | "full";
    timeStyle?: "short" | "medium" | "long" | "full";
    hour12?: boolean;
    relative?: boolean;
  }
): string {
  const {
    locale = navigator.language,
    dateStyle = "medium",
    timeStyle,
    hour12,
    relative = false,
  } = options || {};

  const date = new Date(dateStr);

  if (relative) {
    const diff = date.getTime() - Date.now();
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    const minutes = Math.round(diff / 60000);
    const hours = Math.round(diff / 3600000);
    const days = Math.round(diff / 86400000);

    if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
    if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
    return rtf.format(days, "day");
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle,
    hour12,
  }).format(date);
}

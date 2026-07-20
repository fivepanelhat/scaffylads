import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns";

export function fmtDate(iso: string): string {
  try {
    return format(parseISO(iso), "EEE d MMM yyyy");
  } catch {
    return iso;
  }
}

export function fmtTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return iso;
  }
}

export function fmtDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "EEE d MMM · HH:mm");
  } catch {
    return iso;
  }
}

export function relativeDayLabel(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    if (isThisWeek(d, { weekStartsOn: 1 })) return format(d, "EEEE");
    return format(d, "EEE d MMM");
  } catch {
    return iso;
  }
}

export function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

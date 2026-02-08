import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime12h(timeStr: string) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const m = minutes.padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  return `${h}:${m} ${ampm}`;
}

export function getVenezuelaToday() {
  const now = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
}

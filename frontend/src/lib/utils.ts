import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS[date.getMonth()] || String(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatDateRange(startDate: string | null | undefined, endDate: string | null | undefined): string {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Présent';
  return `${start} — ${end}`;
}
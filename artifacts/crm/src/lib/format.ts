import { format, parseISO } from "date-fns";

export function formatDate(dateString: string | undefined | null) {
  if (!dateString) return "";
  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null) {
  if (!dateString) return "";
  try {
    return format(parseISO(dateString), "MMM d, yyyy HH:mm");
  } catch (e) {
    return dateString;
  }
}

export function formatCurrency(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

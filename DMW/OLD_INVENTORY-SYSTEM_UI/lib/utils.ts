
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toDate = (value: any): Date | null => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  // Handle Firestore Timestamp
  if (typeof value === 'object' && typeof value.toDate === 'function' && value.toDate() instanceof Date) {
    return value.toDate();
  }
  // Handle ISO 8601 string
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  // Handle milliseconds number
  if (typeof value === 'number') {
    return new Date(value);
  }
  
  console.warn("Could not convert value to Date:", value);
  return null;
};

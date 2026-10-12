import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { ApiResponse } from "@/types/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isOrganizer = (role: UserRole) =>
  role === "organizer" || role === "admin";

export const isVolunteer = (role: UserRole) =>
  role === "organizer" || role === "admin" || role === "volunteer";

// Helper function for imitating a network request delay
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }

  const data: ApiResponse<T> = await res.json();

  return data;
}

export const getAbsoluteUrl = (path: string) => {
  let baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_APP_URL;

  return `${baseUrl}${path}`;
};

export function generateRandomCode(length: number): string {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

/**
 * Formats an array of strings into select options
 * @param options Array of strings to format
 * @returns Array of objects with value and label properties
 */
export const formatOptions = (options: string[]) => {
  return options.map((option) => ({
    value: option,
    label: option,
  }));
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString("en-US", {
    timeZone: "America/Toronto",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

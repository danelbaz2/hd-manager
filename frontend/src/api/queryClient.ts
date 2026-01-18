/**
 * TanStack Query Client Configuration
 * Central configuration for all API data caching and fetching
 */
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      // Cache is kept for 5 minutes after component unmounts
      gcTime: 5 * 60 * 1000,
      // Retry failed requests up to 2 times
      retry: 2,
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Query Keys - Centralized for consistency
export const queryKeys = {
  // Tasks
  tasks: {
    all: ["tasks"] as const,
    byDate: (date: number) => ["tasks", "date", date] as const,
    byDateRange: (start: number, end: number) => ["tasks", "range", start, end] as const,
    byUser: (userId: string) => ["tasks", "user", userId] as const,
    single: (id: string) => ["tasks", id] as const,
    history: (taskId: string) => ["tasks", taskId, "history"] as const,
    historyByDate: (date: number) => ["tasks", "history", "date", date] as const,
  },
  // Users
  users: {
    all: ["users"] as const,
    single: (id: string) => ["users", id] as const,
  },
  // Tags
  primaryTags: {
    all: ["primaryTags"] as const,
  },
  secondaryTags: {
    all: ["secondaryTags"] as const,
  },
  // Contacts
  contacts: {
    all: ["contacts"] as const,
  },
  // History
  history: {
    all: ["tasks", "history", "all"] as const,
    byTask: (taskId: string) => ["tasks", taskId, "history"] as const,
  },
  // Military Hierarchy
  militaryHierarchy: {
    all: ["militaryHierarchy"] as const,
  },
  // Chat Messages
  chatMessages: {
    all: ["chatMessages"] as const,
  },
};

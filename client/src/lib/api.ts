import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "./auth-store";

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  withCredentials: false,
});

// --- Request interceptor: attach access token ---
api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: auto-refresh on 401 ---
// Serialize concurrent refreshes so we only hit /refresh once.
let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

async function refreshOnce(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefresh } = res.data as {
      accessToken: string;
      refreshToken: string;
    };
    tokenStore.set(accessToken, newRefresh);
    return { accessToken, refreshToken: newRefresh };
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean } | undefined;
    if (!original || original._retry) return Promise.reject(error);

    // Don't try to refresh on auth endpoints themselves
    if (original.url?.includes("/auth/refresh") || original.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      original._retry = true;
      refreshPromise = refreshPromise ?? refreshOnce();
      const tokens = await refreshPromise;
      refreshPromise = null;
      if (!tokens) return Promise.reject(error);
      if (original.headers) original.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return api.request(original);
    }
    return Promise.reject(error);
  },
);

// --- Shared types ---

export interface ApiPagination<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiUser {
  id: string;
  email?: string;
  name: string;
  role: "HIRE" | "WORK" | "BOTH";
  emailVerified?: boolean;
  university: string | null;
  major: string | null;
  gradYear: number | null;
  headline: string | null;
  bio: string | null;
  hourlyRate: number | null;
  avatar: string | null;
  skills?: string[];
  portfolio?: Array<{ id: string; imageUrl: string; caption: string | null }>;
  authProvider?: "LOCAL" | "GOOGLE";
  createdAt?: string;
}

export interface ApiJob {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetType: "FIXED" | "HOURLY" | "MONTHLY";
  budgetAmount: number;
  deadline: string | null;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    avatar: string | null;
    university: string | null;
  };
  skills: string[];
  proposalCount: number;
}

export interface ApiProposal {
  id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  bidAmount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    category: string;
    budgetType: string;
    budgetAmount: number;
    clientId: string;
    status: string;
  };
  freelancer: {
    id: string;
    name: string;
    avatar: string | null;
    university: string | null;
    headline: string | null;
    hourlyRate: number | null;
  };
}

export interface AuthSuccess {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string } } | undefined;
    return data?.error?.message ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

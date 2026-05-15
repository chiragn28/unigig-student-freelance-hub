import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiJob, type ApiPagination, type ApiProposal, type ApiUser } from "./api";

const isBrowser = (): boolean => typeof window !== "undefined";

// =========================================================================
// Users / freelancers
// =========================================================================

export interface UsersQuery {
  page?: number;
  limit?: number;
  q?: string;
  skill?: string;
  university?: string;
  minRate?: number;
  maxRate?: number;
}

export function useUsers(query: UsersQuery = {}) {
  return useQuery({
    queryKey: ["users", query],
    enabled: isBrowser(),
    queryFn: async () => {
      const res = await api.get<ApiPagination<ApiUser>>("/users", { params: query });
      return res.data;
    },
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ["user", id],
    enabled: isBrowser() && !!id,
    queryFn: async () => {
      const res = await api.get<ApiUser>(`/users/${id}`);
      return res.data;
    },
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ApiUser> & { skills?: string[] }) => {
      const res = await api.patch<ApiUser>("/users/me", input);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    enabled: isBrowser(),
    queryFn: async () => {
      const res = await api.get<ApiUser>("/auth/me");
      return res.data;
    },
    retry: false,
  });
}

// =========================================================================
// Jobs
// =========================================================================

export interface JobsQuery {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  skill?: string;
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  budgetType?: "FIXED" | "HOURLY" | "MONTHLY";
  minBudget?: number;
  maxBudget?: number;
}

export function useJobs(query: JobsQuery = {}) {
  return useQuery({
    queryKey: ["jobs", query],
    enabled: isBrowser(),
    queryFn: async () => {
      const res = await api.get<ApiPagination<ApiJob>>("/jobs", { params: query });
      return res.data;
    },
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ["job", id],
    enabled: isBrowser() && !!id,
    queryFn: async () => {
      const res = await api.get<ApiJob>(`/jobs/${id}`);
      return res.data;
    },
  });
}

export interface CreateJobInput {
  title: string;
  description: string;
  category: string;
  budgetType: "FIXED" | "HOURLY" | "MONTHLY";
  budgetAmount: number;
  deadline?: string;
  skills?: string[];
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateJobInput) => {
      const res = await api.post<ApiJob>("/jobs", input);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

// =========================================================================
// Proposals
// =========================================================================

export function useMyProposals() {
  return useQuery({
    queryKey: ["proposals", "mine"],
    enabled: isBrowser(),
    queryFn: async () => {
      const res = await api.get<ApiPagination<ApiProposal>>("/proposals/mine");
      return res.data;
    },
    retry: false,
  });
}

export interface CreateProposalInput {
  jobId: string;
  coverLetter: string;
  bidAmount: number;
}

export function useCreateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProposalInput) => {
      const res = await api.post<ApiProposal>("/proposals", input);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

// =========================================================================
// Email verification
// =========================================================================

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post<{ message: string; email: string }>("/auth/verify-email", { token });
      return res.data;
    },
  });
}

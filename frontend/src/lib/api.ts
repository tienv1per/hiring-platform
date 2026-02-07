import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { getSession } from "next-auth/react";

// API Base URLs
const API_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:8001",
  user: process.env.NEXT_PUBLIC_USER_URL || "http://localhost:8002",
  job: process.env.NEXT_PUBLIC_JOB_URL || "http://localhost:8003",
  utility: process.env.NEXT_PUBLIC_UTILITY_URL || "http://localhost:8004",
};

// Create axios instances for each service
const createApiClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add auth token from NextAuth session
  instance.interceptors.request.use(
    async (config) => {
      // Get token from NextAuth session
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Clear session and redirect to login on unauthorized
        if (typeof window !== "undefined") {
          // Only redirect if not already on the login page
          if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Export API clients
export const authApi = createApiClient(API_URLS.auth);
export const userApi = createApiClient(API_URLS.user);
export const jobApi = createApiClient(API_URLS.job);
export const utilityApi = createApiClient(API_URLS.utility);

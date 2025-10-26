/**
 * Application configuration
 * Centralizes environment variable access
 */

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
} as const

export const API_BASE_URL = config.apiBaseUrl

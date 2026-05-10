import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api/v1" : "https://albarakametal.vercel.app/api/v1");
const TOKEN_KEY = "accessToken";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getApiErrorMessage(error) {
  const responseMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.errors?.[0]?.message;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  if (Array.isArray(responseMessage) && responseMessage[0]) {
    return String(responseMessage[0]);
  }

  return "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.";
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAccessToken();
      localStorage.removeItem("isAuthorized");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

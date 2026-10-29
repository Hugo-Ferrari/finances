import axios from "axios";

const sameOrigin = process.env.NEXT_PUBLIC_API_MODE === "same-origin";

const apiBaseUrl = sameOrigin
  ? "/api"
  : process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export default api;
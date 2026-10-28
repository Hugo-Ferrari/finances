import axios from "axios";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_MODE === "same-origin"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL?.trim() ||
      (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export default api;
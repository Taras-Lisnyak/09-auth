import axios from "axios";

const resolveBaseURL = () => {
  if (typeof window !== "undefined") {
    return "/api";
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? process.env.NEXT_PUBLIC_SITE_URL
    ?? "http://localhost:3000";

  return `${appUrl}/api`;
};

export const nextServer = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
});

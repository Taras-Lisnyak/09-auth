import axios from 'axios';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const resolveBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Always call local Next API routes from the same origin in browser.
    return '/api';
  }

  const deploymentUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;

  const appUrl = deploymentUrl ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  return `${trimTrailingSlash(appUrl)}/api`;
};

export const nextServer = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
});
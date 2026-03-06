import axios from 'axios';

export type ApiError = {
  message: string;
  status?: number;
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
};

export const api = axios.create({
  baseURL: 'https://notehub-api.goit.study',
  withCredentials: true,
});
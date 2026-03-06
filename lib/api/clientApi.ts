import { nextServer } from './api';
import axios from 'axios';
import type { Note } from '@/types/note';
import type { FetchNotesResponse } from '@/types/fetchNotesResponse';
import type { User } from '@/types/user';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelay = (error: unknown, attempt: number) => {
  if (axios.isAxiosError(error)) {
    const retryAfter = error.response?.headers?.['retry-after'];
    const retryAfterSeconds = Number(retryAfter);

    if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
      return retryAfterSeconds * 1000;
    }
  }

  return attempt * 1500;
};

const normalizeFetchNotesResponse = (payload: unknown): FetchNotesResponse => {
  if (Array.isArray(payload)) {
    return { notes: payload as Note[], totalPages: 1 };
  }

  if (typeof payload === 'object' && payload !== null) {
    const candidate = payload as {
      notes?: unknown;
      data?: unknown;
      totalPages?: unknown;
      total_pages?: unknown;
      meta?: {
        totalPages?: unknown;
        total_pages?: unknown;
        pages?: unknown;
      };
    };

    const notes = Array.isArray(candidate.notes)
      ? candidate.notes
      : Array.isArray(candidate.data)
        ? candidate.data
        : [];

    const totalPagesRaw =
      candidate.totalPages
      ?? candidate.total_pages
      ?? candidate.meta?.totalPages
      ?? candidate.meta?.total_pages
      ?? candidate.meta?.pages;

    const totalPages =
      typeof totalPagesRaw === 'number' && Number.isFinite(totalPagesRaw) && totalPagesRaw > 0
        ? totalPagesRaw
        : 1;

    return {
      notes: notes as Note[],
      totalPages,
    };
  }

  return { notes: [], totalPages: 1 };
};

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: string;
}

type ApiUser = {
  email: string;
  userName?: string;
  photoUrl?: string;
  username?: string;
  avatar?: string;
};

export type UpdateUserRequest = {
  username?: string;
  avatar?: string;
  userName?: string;
  photoUrl?: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  userName?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

type CheckSessionResponse = {
  success?: boolean;
};

const toUser = (value: ApiUser): User => {
  const username = value.userName ?? value.username ?? '';
  const avatar = value.photoUrl ?? value.avatar ?? '';

  return {
    email: value.email,
    username,
    avatar,
  };
};

const normalizeUpdatePayload = (payload: UpdateUserRequest) => {
  const normalizedUsername = (payload.username ?? payload.userName ?? '').trim();
  const normalizedAvatar = (payload.avatar ?? payload.photoUrl ?? '').trim();

  const result: { username?: string; avatar?: string } = {};

  if (normalizedUsername) {
    result.username = normalizedUsername;
  }

  if (normalizedAvatar) {
    result.avatar = normalizedAvatar;
  }

  return result;
};

export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await nextServer.get<unknown>('/categories');
    const data = response.data;

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((category) => {
        if (typeof category === 'string') {
          return category;
        }

        if (typeof category === 'object' && category !== null) {
          const candidate = (category as { name?: unknown; title?: unknown }).name
            ?? (category as { name?: unknown; title?: unknown }).title;

          return typeof candidate === 'string' ? candidate : null;
        }

        return null;
      })
      .filter((category): category is string => Boolean(category));
  } catch {
    return [];
  }
};

export const fetchNotes = async (
  page: number,
  perPage: number,
  search?: string,
  tag?: string
): Promise<FetchNotesResponse> => {
  const params: { page: number; perPage: number; search?: string; tag?: string } = {
    page,
    perPage,
  };

  if (search) params.search = search;
  if (tag) params.tag = tag;

  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await nextServer.get<unknown>('/notes', { params });
      return normalizeFetchNotesResponse(response.data);
    } catch (error) {
      lastError = error;

      if (axios.isAxiosError(error) && error.response?.status === 429 && attempt < 3) {
        await sleep(getRetryDelay(error, attempt));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const normalizedIdMatch = id.match(/[a-z0-9]{20,}$/i);
  const normalizedId = normalizedIdMatch ? normalizedIdMatch[0] : id;

  const response = await nextServer.get<Note>(`/notes/${normalizedId}`);
  return response.data;
};

export const createNote = async (note: CreateNoteParams): Promise<Note> => {
  try {
    const response = await nextServer.post<Note>('/notes', note);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const isSessionActive = await checkSession();
      if (isSessionActive) {
        const retryResponse = await nextServer.post<Note>('/notes', note);
        return retryResponse.data;
      }
    }

    throw error;
  }
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response = await nextServer.delete<Note>(`/notes/${id}`);
  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const payload = {
    email: data.email,
    password: data.password,
  };
  const res = await nextServer.post<ApiUser>('/auth/register', payload);
  return toUser(res.data);
};

export const login = async (data: LoginRequest) => {
  const res = await nextServer.post<ApiUser>('/auth/login', data);
  return toUser(res.data);
};

export const logout = async (): Promise<void> => {
  await nextServer.post('/auth/logout');
};

export const checkSession = async (): Promise<boolean> => {
  const res = await nextServer.get<CheckSessionResponse>('/auth/session');
  return Boolean(res.data?.success);
};

export const getMe = async (): Promise<User> => {
  try {
    const res = await nextServer.get<ApiUser>('/users/me');
    return toUser(res.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const hasSession = await checkSession();

      if (hasSession) {
        const retryRes = await nextServer.get<ApiUser>('/users/me');
        return toUser(retryRes.data);
      }
    }

    throw error;
  }
};

export const updateMe = async (payload: UpdateUserRequest) => {
  const normalizedPayload = normalizeUpdatePayload(payload);

  if (Object.keys(normalizedPayload).length === 0) {
    return getMe();
  }

  try {
    const res = await nextServer.patch<ApiUser>('/users/me', normalizedPayload);
    return toUser(res.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const hasSession = await checkSession();

      if (hasSession) {
        const retryRes = await nextServer.patch<ApiUser>('/users/me', normalizedPayload);
        return toUser(retryRes.data);
      }
    }

    throw error;
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await nextServer.post('/upload', formData);
  return data.url;
};
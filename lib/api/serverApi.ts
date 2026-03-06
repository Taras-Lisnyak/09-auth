import { nextServer } from './api';
import type { FetchNotesResponse } from '@/types/fetchNotesResponse';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';

type ApiUser = {
  email: string;
  userName?: string;
  photoUrl?: string;
  username?: string;
  avatar?: string;
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

const getCookieHeader = async (cookieHeader?: string) => {
  if (cookieHeader !== undefined) {
    return cookieHeader;
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.toString();
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

  const response = await nextServer.get<unknown>('/notes', {
    params,
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return normalizeFetchNotesResponse(response.data);
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const normalizedIdMatch = id.match(/[a-z0-9]{20,}$/i);
  const normalizedId = normalizedIdMatch ? normalizedIdMatch[0] : id;

  const response = await nextServer.get<Note>(`/notes/${normalizedId}`, {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return response.data;
};

export const checkSession = async (cookieHeader?: string): Promise<boolean> => {
  const res = await nextServer.get<{ success?: boolean }>('/auth/session', {
    headers: {
      Cookie: await getCookieHeader(cookieHeader),
    },
  });

  return Boolean(res.data?.success);
};

export const getMe = async (): Promise<User> => {
  const response = await nextServer.get<ApiUser>('/users/me', {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });
  return toUser(response.data);
};

export const checkServerSession = async (cookieHeader?: string) => {
  const res = await nextServer.get('/auth/session', {
    headers: {
      Cookie: await getCookieHeader(cookieHeader),
    },
  });

  return res;
};

export const getServerMe = async (): Promise<User> => {
  return getMe();
};
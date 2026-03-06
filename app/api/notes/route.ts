import { NextRequest, NextResponse } from 'next/server';
import { api } from '../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../_utils/utils';
import { parse } from 'cookie';

const applySetCookieToStore = async (setCookie: string | string[] | undefined) => {
  if (!setCookie) {
    return;
  }

  const cookieStore = await cookies();
  const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];

  for (const cookieStr of cookieArray) {
    const parsed = parse(cookieStr);
    const options = {
      expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
      path: parsed.Path,
      maxAge: Number(parsed['Max-Age']),
    };

    if (parsed.accessToken) cookieStore.set('accessToken', parsed.accessToken, options);
    if (parsed.refreshToken) cookieStore.set('refreshToken', parsed.refreshToken, options);
  }
};

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') ?? '';
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1);
  const rawTag = request.nextUrl.searchParams.get('tag') ?? '';
  const tag = rawTag === 'All' ? '' : rawTag;

  const loadNotes = async () => {
    const cookieStore = await cookies();
    return api('/notes', {
      params: {
        ...(search !== '' && { search }),
        page,
        perPage: 12,
        ...(tag && { tag }),
      },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
  };

  try {
    const res = await loadNotes();

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        try {
          const cookieStore = await cookies();
          const sessionRes = await api.get('auth/session', {
            headers: {
              Cookie: cookieStore.toString(),
            },
          });

          await applySetCookieToStore(sessionRes.headers['set-cookie']);

          const retryRes = await loadNotes();
          return NextResponse.json(retryRes.data, { status: retryRes.status });
        } catch (refreshError) {
          if (isAxiosError(refreshError)) {
            logErrorResponse(refreshError.response?.data);
          } else {
            logErrorResponse({ message: (refreshError as Error).message });
          }

          return NextResponse.json({ notes: [], totalPages: 0 }, { status: 200 });
        }
      }

      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status ?? 500 }
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const createNoteRequest = async () => {
    const cookieStore = await cookies();
    return api.post('/notes', body, {
      headers: {
        Cookie: cookieStore.toString(),
        'Content-Type': 'application/json',
      },
    });
  };

  try {
    const res = await createNoteRequest();

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        try {
          const cookieStore = await cookies();
          const sessionRes = await api.get('auth/session', {
            headers: {
              Cookie: cookieStore.toString(),
            },
          });

          await applySetCookieToStore(sessionRes.headers['set-cookie']);

          const retryRes = await createNoteRequest();
          return NextResponse.json(retryRes.data, { status: retryRes.status });
        } catch (refreshError) {
          if (isAxiosError(refreshError)) {
            logErrorResponse(refreshError.response?.data);
            return NextResponse.json(
              { error: refreshError.message, response: refreshError.response?.data },
              { status: refreshError.response?.status ?? 401 }
            );
          }

          logErrorResponse({ message: (refreshError as Error).message });
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status ?? 500 }
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { logErrorResponse } from '../../_utils/utils';
import { isAxiosError } from 'axios';
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

export async function GET() {
  const getMeRequest = async () => {
    const cookieStore = await cookies();

    return api.get('/users/me', {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
  };

  try {
    const res = await getMeRequest();
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

          const retryRes = await getMeRequest();
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

export async function PATCH(request: Request) {
  const body = await request.json();

  const patchMeRequest = async () => {
    const cookieStore = await cookies();

    return api.patch('/users/me', body, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
  };

  try {
    const res = await patchMeRequest();
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

          const retryRes = await patchMeRequest();
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
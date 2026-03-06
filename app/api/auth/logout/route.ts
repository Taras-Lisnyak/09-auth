import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';

export async function POST() {
  const cookieStore = await cookies();

  try {
    await api.post('/auth/logout', null, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
  } catch (error) {
    if (isAxiosError(error)) {
      // Upstream may return 400/401 if session is already invalid.
      // Treat it as logged out and clear local cookies anyway.
      if (error.response?.status !== 400 && error.response?.status !== 401) {
        logErrorResponse(error.response?.data);
      }
    } else {
      logErrorResponse({ message: (error as Error).message });
    }
  }

  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');

  return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
}
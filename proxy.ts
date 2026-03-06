import { NextRequest, NextResponse } from 'next/server';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

const toSetCookieArray = (setCookie: string | string[] | undefined): string[] => {
  if (!setCookie) {
    return [];
  }

  return Array.isArray(setCookie) ? setCookie : [setCookie];
};

const attachSetCookies = (response: NextResponse, setCookies: string[]) => {
  for (const cookie of setCookies) {
    response.headers.append('set-cookie', cookie);
  }

  return response;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

  if (accessToken) {
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  if (refreshToken) {
    try {
      const sessionResponse = await checkServerSession(request.headers.get('cookie') ?? '');
      const data = sessionResponse.data as { success?: boolean };

      if (data.success) {
        const setCookies = toSetCookieArray(sessionResponse.headers['set-cookie']);

        if (isPublicRoute) {
          const response = NextResponse.redirect(new URL('/', request.url));
          return attachSetCookies(response, setCookies);
        }

        const response = NextResponse.next();
        return attachSetCookies(response, setCookies);
      }
    } catch {
      // If session refresh fails, treat user as unauthenticated.
    }
  }

  if (isPrivateRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
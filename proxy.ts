import { NextRequest, NextResponse } from 'next/server';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

  if (accessToken) {
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    return NextResponse.next();
  }

  if (refreshToken) {
    try {
      const sessionResponse = await fetch(new URL('/api/auth/session', request.url), {
        method: 'GET',
        headers: {
          Cookie: request.headers.get('cookie') ?? '',
        },
        cache: 'no-store',
      });

      const data = (await sessionResponse.json()) as { success?: boolean };

      if (data.success) {
        if (isPublicRoute) {
          return NextResponse.redirect(new URL('/profile', request.url));
        }

        return NextResponse.next();
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
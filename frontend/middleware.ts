import { encode, getToken, JWT } from 'next-auth/jwt';
import { auth } from '@/auth';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, IToken } from '@kata/typings';
import { routing } from './i18n/routing';

const { locales, localePrefix, defaultLocale } = routing;

const publicPages = ['/', '/auth/login'];

const intlMiddleware = createIntlMiddleware({
  locales,
  localePrefix,
  defaultLocale,
});

const authMiddleware = auth((req) => {
  const isLoggedIn = !!req.auth;

  if (isLoggedIn) return intlMiddleware(req);
});

const SESSION_COOKIE = process.env.AUTH_URL?.startsWith('https://')
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token';
const SESSION_SECURE = process.env.AUTH_URL?.startsWith('https://');
const SIGNIN_SUB_URL = '/auth/login';
const SESSION_TIMEOUT = 7 * 24 * 60 * 60; // 7d like refresh token lifetime in backend

export default async function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .map((p) => (p === '/' ? '(/|$)' : `(${p})(/.*|$)`))
      .join('|')})$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      salt: 'authjs.session-token',
    });

    if (!token) return signOut(req);

    let response = NextResponse.next();

    if (shouldUpdateToken(token.tokens)) {
      try {
        const refreshTokens = await refreshAccessToken(token);
        const newSessionToken = await encode({
          salt: 'authjs.session-token',
          secret: process.env.AUTH_SECRET as string,
          token: {
            ...token,
            tokens: {
              access_token: refreshTokens.tokens.accessToken,
              refresh_token: token.tokens.refreshToken,
              expires_in: refreshTokens.tokens.expiresIn,
            },
          },
          maxAge: SESSION_TIMEOUT,
        });

        response = updateCookie(newSessionToken, req, response);
      } catch (error) {
        return updateCookie(null, req, response);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

function signOut(request: NextRequest) {
  const response = NextResponse.redirect(new URL(SIGNIN_SUB_URL, request.url));

  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.includes('authjs.session-token'))
      response.cookies.delete(cookie.name);
  });

  return response;
}

function shouldUpdateToken(tokens: IToken) {
  return tokens.expiresIn < Math.floor(Date.now());
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const res = await fetch(`${process.env.API_PLAYER}/api/auth/refresh-token`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token.tokens.refreshToken}`,
    },
  });

  const response: ApiResponse<IToken> = await res.json();

  if (res.status == 403) {
    throw new Error('RefreshTokenError');
  }

  return {
    ...token,
    tokens: response.data,
  };
}

function updateCookie(
  sessionToken: string | null,
  request: NextRequest,
  response: NextResponse
): NextResponse<unknown> {
  if (sessionToken && sessionToken !== null) {
    request?.cookies?.set(SESSION_COOKIE, sessionToken);
    response = NextResponse.next({
      request: {
        headers: request?.headers,
      },
    });
    response?.cookies?.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      maxAge: SESSION_TIMEOUT,
      secure: SESSION_SECURE,
      sameSite: 'lax',
    });
  } else {
    return signOut(request);
  }

  return response;
}

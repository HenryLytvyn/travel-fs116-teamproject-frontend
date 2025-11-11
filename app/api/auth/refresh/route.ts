import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '../../api';
import { parse } from 'cookie';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;
    const sessionId = cookieStore.get('sessionId')?.value;
    const next = request.nextUrl.searchParams.get('next'); // Only redirect if explicitly provided

    if (!refreshToken || !sessionId) {
      return NextResponse.json(
        { error: 'Refresh token or session ID missing' },
        { status: 401 }
      );
    }

    const apiRes = await api.post(
      'auth/refresh',
      {},
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
      }
    );
    const setCookie = apiRes.headers['set-cookie'];
    if (setCookie) {
      const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];

      // Parse all cookies with proper options
      for (const cookieStr of cookieArray) {
        const parsed = parse(cookieStr);
        const options: {
          expires?: Date;
          path?: string;
          maxAge?: number;
          httpOnly?: boolean;
          secure?: boolean;
          sameSite?: 'strict' | 'lax' | 'none';
        } = {};

        // Parse expires date with validation
        if (parsed.Expires) {
          const expiresDate = new Date(parsed.Expires);
          if (!isNaN(expiresDate.getTime())) {
            options.expires = expiresDate;
          }
        }

        // Parse path
        if (parsed.Path) {
          options.path = parsed.Path;
        }

        // Parse maxAge with validation
        const maxAge = Number(parsed['Max-Age']);
        if (!isNaN(maxAge) && maxAge > 0) {
          options.maxAge = maxAge;
        }

        // Parse httpOnly flag
        if (parsed.HttpOnly === 'true' || parsed.HttpOnly === '') {
          options.httpOnly = true;
        }

        // Parse secure flag
        if (parsed.Secure === 'true' || parsed.Secure === '') {
          options.secure = true;
        }

        // Parse sameSite attribute
        if (parsed.SameSite) {
          const sameSite = parsed.SameSite.toLowerCase();
          if (['strict', 'lax', 'none'].includes(sameSite)) {
            options.sameSite = sameSite as 'strict' | 'lax' | 'none';
          }
        }

        // Set accessToken cookie
        if (parsed.accessToken) {
          cookieStore.set('accessToken', parsed.accessToken, options);
        }

        // Set refreshToken cookie
        if (parsed.refreshToken) {
          cookieStore.set('refreshToken', parsed.refreshToken, options);
        }

        // Set sessionId cookie
        if (parsed.sessionId) {
          cookieStore.set('sessionId', parsed.sessionId, options);
        }
      }

      // If 'next' query param exists, redirect (for browser navigation)
      if (next) {
        return NextResponse.redirect(new URL(next, request.url), {
          headers: {
            'set-cookie': cookieStore.toString(),
          },
        });
      }

      // Otherwise, return JSON (for API calls from interceptor)
      // This is the default behavior for programmatic calls
      return NextResponse.json(
        {
          status: 200,
          message: 'Session refreshed successfully',
          data: apiRes.data,
        },
        {
          status: 200,
          headers: {
            'set-cookie': cookieStore.toString(),
          },
        }
      );
    }
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 401 }
    );
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      const status = error.response?.status || 500;
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status }
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

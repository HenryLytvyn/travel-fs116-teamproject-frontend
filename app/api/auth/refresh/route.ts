import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '../../api';
import { parse } from 'cookie';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';
import { parseCookieOptions } from '../../_utils/cookieUtils';

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
        const options = parseCookieOptions(cookieStr);

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

      if (next) {
        return NextResponse.redirect(new URL(next, request.url), {
          headers: {
            'set-cookie': cookieStore.toString(),
          },
        });
      }

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

import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiRes = await api.post('auth/register', body);

    const cookieStore = await cookies();
    const setCookie = apiRes.headers['set-cookie'];

    if (setCookie) {
      const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
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
      return NextResponse.json(apiRes.data, { status: apiRes.status });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

import { invariant } from '@epic-web/invariant';
import { createCookieSessionStorage } from '@remix-run/node';

invariant(process.env.SESSION_SECRET, 'Missing SESSION_SECRET env var');

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: process.env.SESSION_SECRET.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function getAuthSession(request: Request) {
  const cookie = request.headers.get('Cookie');

  return await authSessionStorage.getSession(cookie);
}

import type { Password, User } from '@prisma/client';
import { redirect, redirectDocument } from '@remix-run/node';
import bcrypt from 'bcryptjs';
import { db } from './db.server';
import { authSessionStorage, getAuthSession } from './session.server';

const USER_SESSION_KEY = 'userId';

export async function getUserId(
  request: Request,
): Promise<User['id'] | undefined> {
  const session = await getAuthSession(request);
  const userId = session.get(USER_SESSION_KEY);

  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw logout(request);
  }

  return user;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);

  if (!userId) {
    const loginParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${loginParams}`);
  }

  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw logout(request);
  }

  return user;
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getAuthSession(request);
  session.set(USER_SESSION_KEY, userId);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await authSessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function createUser({
  username,
  first,
  last,
  email,
  password,
}: Pick<User, 'username' | 'first' | 'last' | 'email'> & { password: string }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      username,
      first,
      last,
      email,
      password: { create: { hash: hashedPassword } },
    },
  });
}

export async function verifyLogin(
  email: User['email'],
  password: Password['hash'],
) {
  const userWithPassword = await db.user.findUnique({
    include: { password: true },
    where: { email },
  });

  if (!userWithPassword?.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  return { id: userWithPassword.id };
}

export async function logout(request: Request) {
  const session = await getAuthSession(request);

  return redirectDocument('/', {
    headers: {
      'Set-Cookie': await authSessionStorage.destroySession(session),
    },
  });
}

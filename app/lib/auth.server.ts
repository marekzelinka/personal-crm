import type { Password, User } from "@prisma/client";
import * as crypto from "node:crypto";
import { redirect, redirectDocument } from "react-router";
import { db } from "./db.server";
import { authSessionStorage, getAuthSession } from "./session.server";

const USER_SESSION_KEY = "userId";

export async function getUserId(
  request: Request,
): Promise<User["id"] | undefined> {
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
    throw await logout(request);
  }

  return user;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);
  if (!userId) {
    const loginParams = new URLSearchParams([["redirectTo", redirectTo]]);

    throw redirect(`/login?${loginParams}`);
  }

  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw await logout(request);
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
  userId: User["id"];
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getAuthSession(request);
  session.set(USER_SESSION_KEY, userId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authSessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function createUser({
  email,
  password,
}: Pick<User, "email"> & { password: string }) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return await db.user.create({
    data: {
      email,
      password: { create: { salt, hash: hashedPassword } },
    },
  });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await db.user.findUnique({
    include: { password: true },
    where: { email },
  });
  if (!userWithPassword?.password) {
    return null;
  }

  const hashedPassword = crypto
    .pbkdf2Sync(password, userWithPassword.password.salt, 100000, 64, "sha512")
    .toString("hex");
  if (hashedPassword !== userWithPassword.password.hash) {
    return null;
  }

  return { id: userWithPassword.id };
}

export async function logout(request: Request) {
  const session = await getAuthSession(request);

  return redirectDocument("/", {
    headers: {
      "Set-Cookie": await authSessionStorage.destroySession(session),
    },
  });
}

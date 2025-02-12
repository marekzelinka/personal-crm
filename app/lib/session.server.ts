import { invariant } from "@epic-web/invariant";
import { createCookieSessionStorage } from "react-router";

invariant(
  process.env.SESSION_SECRET_CURRENT,
  "Missing SESSION_SECRET_CURRENT env var",
);
invariant(
  process.env.SESSION_SECRET_PREVIOUS,
  "Missing SESSION_SECRET_PREVIOUS env var",
);
invariant(process.env.SESSION_SECRET_OLD, "Missing SESSION_SECRET_OLD env var");

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [
      process.env.SESSION_SECRET_CURRENT,
      process.env.SESSION_SECRET_PREVIOUS,
      process.env.SESSION_SECRET_OLD,
    ],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getAuthSession(request: Request) {
  const cookie = request.headers.get("Cookie");

  return await authSessionStorage.getSession(cookie);
}

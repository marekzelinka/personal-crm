import { z } from "zod";

export const EmailSchema = z
  .string({ required_error: "Email is required" })
  .email({ message: "Email is invalid" })
  .min(3, { message: "Email is too short" })
  .max(100, { message: "Email is too long" })
  // users can type the email in any case, but we store it in lowercase
  .transform((value) => value.toLowerCase());

export const PasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(6, { message: "Password is too short" })
  // NOTE: bcrypt has a limit of 72 bytes (which should be plenty long)
  // https://github.com/epicweb-dev/epic-stack/issues/918
  .refine((val) => new TextEncoder().encode(val).length <= 72, {
    message: "Password is too long",
  });

// lib/validators.ts
import { z } from "zod";

/**
 * Password policy:
 * - Minimum 8 characters
 * - At least one lowercase
 * - At least one uppercase
 * - At least one digit
 * - At least one special character
 */
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const commonPasswords = [
  "password","12345678","qwerty","123456789","11111111","1234567","password1",
  "123123","abc123","iloveyou","admin","letmein"
];

export const signupSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Invalid email" }),
  username: z.string()
    .min(3, { message: "At least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Only letters, numbers and underscores" }),
  password: z.string()
    .min(8, { message: "Minimum 8 characters" })
    .regex(passwordRegex, { message: "Password must include uppercase, lowercase, number and special character" })
});

export type SignupInput = z.infer<typeof signupSchema>;

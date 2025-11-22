// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { comparePwd } from "../../../lib/hash";
import { signToken } from "../../../lib/jwt";
import { verifyCaptchaToken } from "../../../lib/recaptcha";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { identifier, password, captchaToken } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({ error: "Missing login fields" });
    }

    // CAPTCHA verification
    const ok = await verifyCaptchaToken(captchaToken);
    if (!ok) {
      return res.status(400).json({
        error: "Failed CAPTCHA. Please refresh and try again.",
      });
    }

    // Find user (email OR username)
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      select: {
        id: true,
        password: true,
        email: true,
        username: true,
      }
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Password check
    const valid = await comparePwd(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Create JWT
    const token = signToken({ userId: user.id });

    // Set cookie
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}`
    );

    return res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

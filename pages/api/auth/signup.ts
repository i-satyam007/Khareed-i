// pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { hashPwd } from "../../../lib/hash";
import { signupSchema, commonPasswords } from "../../../lib/validators";
import { verifyCaptchaToken } from "../../../lib/recaptcha";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { captchaToken, ...rest } = req.body || {};

    // 1) Verify CAPTCHA
    const ok = await verifyCaptchaToken(captchaToken, "signup");
    if (!ok) {
      return res
        .status(400)
        .json({ error: "Failed CAPTCHA. Please refresh and try again." });
    }

    // 2) Validate input
    const parse = signupSchema.safeParse(rest);
    if (!parse.success) {
      // zod exposes issues array; map them to messages
      const msg = parse.error.issues.map((issue) => issue.message).join(", ");
      return res.status(400).json({ error: msg });
    }

    const { email, username, password, name, phone, hostel, avatar, otp } = parse.data;

    // 2.5) Verify OTP
    if (!otp) {
      return res.status(400).json({ error: "OTP is required" });
    }

    const verification = await prisma.verificationCode.findUnique({
      where: { email }
    });

    if (!verification || verification.code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (verification.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // 3) Weak/common password check
    const lower = password.toLowerCase();
    if (commonPasswords.includes(lower)) {
      return res
        .status(400)
        .json({ error: "Password is too common. Choose a stronger password." });
    }

    // 4) Unique email/username
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Email or username already exists" });
    }

    // 5) Hash + create
    const hashed = await hashPwd(password);
    const isVerifiedStudent = email.endsWith("@iimidr.ac.in");

    const user = await prisma.user.create({
      data: { email, username, password: hashed, name, phone, hostel, avatar, isVerifiedStudent },
    });

    // Delete used OTP
    await prisma.verificationCode.delete({ where: { email } });

    return res.status(201).json({ success: true, id: user.id });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

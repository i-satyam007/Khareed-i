import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { hashPwd } from "../../../lib/hash";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: "Missing fields" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Check if OTP matches
    if (user.resetOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check if expired
    if (new Date() > user.resetOTPExpiry) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Hash new password and clear OTP
    const hashedPassword = await hashPwd(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetOTP: null,
        resetOTPExpiry: null
      }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
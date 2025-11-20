// pages/api/auth/forgot-username.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { sendUsername } from "../../../lib/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // ✅ NEW: Specific feedback as requested
    if (!user) {
      return res.status(404).json({ success: false, error: "Email not found linked with any account" });
    }

    await sendUsername(email, user.username);
    
    return res.json({ success: true, message: "An email has been sent to your email address" });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
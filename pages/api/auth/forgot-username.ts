import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { sendUsername } from "../../../lib/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await sendUsername(email, user.username);
    }
    // Always return success to prevent email scraping
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
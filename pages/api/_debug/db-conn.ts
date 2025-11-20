// pages/api/_debug/db-conn.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const p = new PrismaClient();
  try {
    await p.$connect();
    await p.$disconnect();
    return res.status(200).json({ ok: true, msg: "prisma connected from runtime" });
  } catch (err: any) {
    // return a short, useful error but not secrets
    return res.status(500).json({ ok: false, error: String(err?.message || err).slice(0, 1000) });
  } finally {
    try { await p.$disconnect(); } catch {}
  }
}

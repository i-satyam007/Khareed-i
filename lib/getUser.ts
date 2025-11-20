import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function getUser(req: any) {
  const cookie = req.headers.cookie || "";
  const tokenCookie = cookie
    .split(";")
    .map((x: string) => x.trim())
    .find((x: string) => x.startsWith("token="));

  if (!tokenCookie) return null;

  const token = tokenCookie.split("=")[1];
  const payload: any = verifyToken(token);
  if (!payload?.userId) return null;

  return prisma.user.findUnique({ where: { id: payload.userId } });
}

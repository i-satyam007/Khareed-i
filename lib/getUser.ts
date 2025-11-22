import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function getUser(req: any) {
  const cookie = req.headers.cookie || "";
  console.log("[DEBUG] Raw Cookie Header:", cookie);

  const tokenCookie = cookie
    .split(";")
    .map((x: string) => x.trim())
    .find((x: string) => x.startsWith("token="));

  if (!tokenCookie) {
    console.log("[DEBUG] No token cookie found");
    return null;
  }

  // Handle potential '=' in the token itself (though JWTs usually don't have them)
  const token = tokenCookie.split("=").slice(1).join("=");
  console.log("[DEBUG] Extracted Token:", token ? `${token.substring(0, 10)}...` : "Empty");

  try {
    const payload: any = verifyToken(token);
    console.log("[DEBUG] Token Verification Payload:", payload);

    if (!payload?.userId) {
      console.log("[DEBUG] No userId in payload");
      return null;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    console.log("[DEBUG] DB User Lookup:", user ? `Found User ID ${user.id}` : "User Not Found");
    return user;
  } catch (error) {
    console.error("[DEBUG] Auth error:", error);
    return null;
  }
}

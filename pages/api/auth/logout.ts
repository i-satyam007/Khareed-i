export default function handler(req: any, res: any) {
  res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  return res.json({ success: true });
}

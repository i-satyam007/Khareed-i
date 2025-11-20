// lib/recaptcha.ts

const isProd = process.env.NODE_ENV === "production";

/**
 * In development, we always return true so you can work locally
 * without Google/domain issues. In production, we call Google.
 */
export async function verifyCaptchaToken(
  token: string | undefined, action?: string
): Promise<boolean> {
  if (!isProd) {
    // Local dev / college demo
    return true;
  }

  if (!token) return false;

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("Missing RECAPTCHA_SECRET_KEY");
    return false;
  }

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: params,
  });

  const data = await res.json();
  // v2: just check success
  return !!data.success;
}

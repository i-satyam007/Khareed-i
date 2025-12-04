import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { sendOTP } from "../../../lib/mail";
  } catch (dbError) {
  console.error("Forgot Password: DB Update Failed:", dbError);
  return res.status(500).json({ error: "Database error" });
}

console.log("Forgot Password: Sending email to", email);
const sent = await sendOTP(email, otp);
console.log("Forgot Password: Email send result:", sent);

if (!sent) {
  console.error("Failed to send password reset OTP to", email);
  return res.status(500).json({ error: "Failed to send email" });
}

return res.json({ success: true });
} catch (error) {
  console.error("Forgot Password Error:", error);
  return res.status(500).json({ error: "Server error" });
}
}
// lib/mail.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(email: string, otp: string) {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Use this default for testing
      to: email,
      subject: 'Your Khareed-i Reset Code',
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
    });
    return true;
  } catch (error) {
    console.error("Resend Error:", error);
    return false;
  }
}

export async function sendUsername(email: string, username: string) {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your Khareed-i Username',
      html: `<p>You requested your username.</p><p>Your username is: <strong>${username}</strong></p>`
    });
    return true;
  } catch (error) {
    console.error("Resend Error:", error);
    return false;
  }
}

export async function sendSignupOTP(email: string, otp: string) {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verify your Khareed-i Account',
      html: `<p>Your verification code for signup is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
    });
    return true;
  } catch (error) {
    console.error("Resend Error:", error);
    return false;
  }
}
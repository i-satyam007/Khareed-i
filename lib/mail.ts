import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(email: string, otp: string) {
  try {
    const data = await resend.emails.send({
      from: 'auth@khareed-i.shop', // Use this default for testing
      to: email,
      subject: 'Your Khareed-i Reset Code',
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
    });
    console.log("Resend Response (sendOTP):", JSON.stringify(data, null, 2));
    if (data.error) {
      console.error("Resend API Error:", data.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend Error in sendOTP:", JSON.stringify(error, null, 2));
    return false;
  }
}

export async function sendUsername(email: string, username: string) {
  try {
    const data = await resend.emails.send({
      from: 'auth@khareed-i.shop',
      to: email,
      subject: 'Your Khareed-i Username',
      html: `<p>You requested your username.</p><p>Your username is: <strong>${username}</strong></p>`
    });
    console.log("Resend Response (sendUsername):", JSON.stringify(data, null, 2));
    if (data.error) {
      console.error("Resend API Error:", data.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend Error in sendUsername:", JSON.stringify(error, null, 2));
    return false;
  }
}

export async function sendSignupOTP(email: string, otp: string) {
  try {
    const data = await resend.emails.send({
      from: 'auth@khareed-i.shop',
      to: email,
      subject: 'Verify your Khareed-i Account',
      html: `<p>Your verification code for signup is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
    });
    console.log("Resend Response (sendSignupOTP):", JSON.stringify(data, null, 2));
    if (data.error) {
      console.error("Resend API Error:", data.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend Error in sendSignupOTP:", JSON.stringify(error, null, 2));
    return false;
  }
}
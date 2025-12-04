import { useForm } from "react-hook-form";
import toast from 'react-hot-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "../lib/validators";
import { useRouter } from "next/router";
// @ts-ignore
import zxcvbn from "zxcvbn";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import ImageCropper from "../components/ImageCropper";
import { Camera, User, MapPin, Phone } from "lucide-react";

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

declare const grecaptcha: any;

function useRenderRecaptcha(elementId: string, siteKey: string | undefined) {
  const widgetRef = useRef<number | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return;
      const g = (window as any).grecaptcha;
      const el = document.getElementById(elementId);
      if (g && el) {
        try {
          if (renderedRef.current && typeof g.reset === "function") {
            g.reset(widgetRef.current);
          } else {
            const wid = g.render(elementId, { sitekey: siteKey });
            widgetRef.current = wid;
            renderedRef.current = true;
          }
        } catch (err) {
          setTimeout(tryRender, 200);
        }
        return;
      }
      setTimeout(tryRender, 200);
    };
    tryRender();
    return () => {
      cancelled = true;
    };
  }, [elementId, siteKey]);
  return widgetRef;
}

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const router = useRouter();
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const password = watch("password") || "";
  const strength = (typeof window !== "undefined" && zxcvbn) ? zxcvbn(password) : { score: 0 };
  const score = Math.min(Math.max(strength.score ?? 0, 0), 4);

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabel = ["Weak", "Fair", "Good", "Strong", "Excellent"][score];

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const widgetRef = useRenderRecaptcha("recap-signup", siteKey);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropImageSrc(null);
    setIsUploading(true);

    const data = new FormData();
    data.append('file', croppedBlob, 'profile.jpg');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      });
      if (res.ok) {
        const { url } = await res.json();
        setAvatarUrl(url);
        setValue('avatar', url);
        toast.success('Profile photo uploaded!');
      } else {
        const err = await res.json();
        toast.error(`Upload failed: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendOtp = async () => {
    const email = watch("email");
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    // Basic email validation before sending
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setOtpTimer(60); // 1 minute cooldown
        toast.success("OTP sent to your email!");
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Failed to send OTP");
    }
  };

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    try {
      let captchaToken: string | undefined;
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        const wid = widgetRef.current;
        captchaToken = (window as any).grecaptcha.getResponse(
          typeof wid === "number" ? wid : undefined
        );
      }

      if (!captchaToken) {
        setServerError("Please complete the CAPTCHA.");
        return;
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, captchaToken }),
      });

      const j = await res.json();
      if (!res.ok) {
        setServerError(j?.error || "Signup failed");
        if ((window as any).grecaptcha) {
          const wid = widgetRef.current;
          try {
            (window as any).grecaptcha.reset(typeof wid === "number" ? wid : undefined);
          } catch (e) { }
        }
        return;
      }

      toast.success("Account created successfully! Please log in.");
      router.push("/login");
    } catch (err) {
      setServerError("Network error");
      toast.error("Network error");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-kh-light overflow-y-auto py-10 relative">

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
        />
      )}

      {/* Back to Home Link */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-kh-gray hover:text-kh-dark transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 mx-4 mt-10">

        {/* Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <Logo className="h-16 w-16" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Already have an account? <Link href="/login" className="font-semibold text-kh-red hover:text-red-600 transition-colors">Sign in</Link>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

          {/* Avatar Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('signup-avatar')?.click()}>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden border-2 border-dashed border-gray-300 hover:border-kh-purple transition-colors">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="h-6 w-6 mb-1" />
                    <span className="text-[10px] font-medium">Add Photo</span>
                  </div>
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <input
                type="file"
                id="signup-avatar"
                className="hidden"
                accept="image/*"
                onChange={onFileChange}
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register("name")}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email & OTP */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
            <div className="flex gap-2">
              <input
                {...register("email")}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
                placeholder="you@iimidr.ac.in"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpTimer > 0}
                className="px-4 py-2 bg-kh-red text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
              >
                {otpTimer > 0 ? `Wait ${otpTimer}s` : (otpSent ? "Resend OTP" : "Send OTP")}
              </button>
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          {/* OTP Input */}
          {otpSent && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Verification Code</label>
              <input
                {...register("otp")}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              {errors.otp && <p className="mt-1 text-xs text-red-500 font-medium">{errors.otp.message}</p>}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Username</label>
            <input
              {...register("username")}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
              placeholder="johndoe123"
            />
            {errors.username && <p className="mt-1 text-xs text-red-500 font-medium">{errors.username.message}</p>}
          </div>

          {/* Phone & Hostel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Phone <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register("phone")}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
                  placeholder="9876543210"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Hostel <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register("hostel")}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
                  placeholder="BH-3, 204"
                />
              </div>
              {errors.hostel && <p className="mt-1 text-xs text-red-500 font-medium">{errors.hostel.message}</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}

            <div className="mt-3">
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out ${strengthColors[score]}`}
                  style={{ width: `${(score + 1) * 20}%` }}
                />
              </div>
              <p className="text-[10px] text-right mt-1 text-gray-400 uppercase font-medium tracking-wider">Strength: <span className={`text-${strengthColors[score].replace('bg-', '')}`}>{strengthLabel}</span></p>
            </div>
          </div>

          {/* CAPTCHA */}
          <div className="flex justify-center py-2">
            <div id="recap-signup" className="scale-90 origin-center" />
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-50 p-3 border border-red-100">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <p className="font-medium">{serverError}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-kh-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kh-red disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating account...
              </span>
            ) : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
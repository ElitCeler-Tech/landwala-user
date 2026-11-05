"use client";

import { AxiosError } from "axios";
import Header from "@/components/Header";
import Link from "next/link";
import { Loader2, Smartphone, Mail } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

type Method = "mobile" | "email";

const RESEND_SECONDS = 30;

const inputClass =
  "w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#2D336B] transition-colors text-gray-700 placeholder:text-gray-400 bg-white";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const { login, isAuthenticated, setLoading, isLoading, user } =
    useAuthStore();

  // Mobile first, as in the app's login screen.
  const [method, setMethod] = useState<Method>("mobile");
  const [error, setError] = useState("");

  // Email + password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mobile number + OTP
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [noAccount, setNoAccount] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Redirect if already authenticated (and user is not new)
  useEffect(() => {
    if (isAuthenticated && !user?.isNewUser) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router, redirectPath]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const switchMethod = (m: Method) => {
    setMethod(m);
    setError("");
    setNoAccount(false);
  };

  type Session = Awaited<ReturnType<typeof authApi.login>>;

  const finishLogin = (response: Session) => {
    login(response.user, {
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
      expiresIn: response.tokens.expiresIn,
    });
    if (response.user.isNewUser) {
      router.push(
        `/signup?complete=true&redirect=${encodeURIComponent(redirectPath)}`,
      );
    } else {
      router.push(redirectPath);
    }
  };

  const apiMessage = (err: unknown, fallback: string) =>
    (err as AxiosError<{ message: string | string[] }>).response?.data
      ?.message?.toString() || fallback;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      finishLogin(await authApi.googleAuth(idToken));
    } catch (err: unknown) {
      console.error("Google login error:", err);
      setError(
        apiMessage(err, "Failed to sign in with Google. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    try {
      setLoading(true);
      setError("");
      finishLogin(await authApi.login({ email, password }));
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(apiMessage(err, "Failed to login. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (phone.length !== 10) {
      setError("Enter a valid 10 digit mobile number");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setNoAccount(false);
      const res = await authApi.requestPhoneOtp(phone);
      if (!res.accountExists) {
        setNoAccount(true);
        return;
      }
      setOtpSent(true);
      setOtp("");
      setResendIn(RESEND_SECONDS);
    } catch (err: unknown) {
      setError(apiMessage(err, "Could not send the OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      await sendOtp();
      return;
    }
    if (otp.length !== 4) {
      setError("Enter the 4 digit OTP");
      return;
    }
    try {
      setLoading(true);
      setError("");
      finishLogin(await authApi.verifyPhoneOtp(phone, otp));
    } catch (err: unknown) {
      setError(apiMessage(err, "Invalid or expired OTP"));
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (m: Method) =>
    `flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      method === m
        ? "bg-white text-[#1d2567] shadow-sm"
        : "text-gray-500 hover:text-[#1d2567]"
    }`;

  const submitLabel = (idle: string, busy: string) =>
    isLoading ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        {busy}
      </>
    ) : (
      idle
    );

  const primaryBtn =
    "w-full bg-[#1d2567] hover:bg-[#151b4d] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2";

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 font-sans text-gray-900 flex flex-col relative overflow-hidden">
      {/* Top Right Gradient Blob */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#2D55FB]/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Bottom Left Gradient Blob */}
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#2D55FB]/30 rounded-full blur-[100px] pointer-events-none" />

      <Header />

      <div className="flex-grow flex items-start md:items-center justify-center px-4 pt-28 pb-10 md:p-4 relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-12 md:gap-24">
          {/* Left side headline: desktop only, the card carries the title on phones */}
          <div className="hidden md:block w-full md:w-1/2 text-left space-y-2 pl-4 md:pl-12">
            <h2
              className="text-[#3b5bdb] text-4xl md:text-5xl italic font-normal mb-2"
              style={{ fontFamily: "serif" }}
            >
              Welcome.
            </h2>
            <h1 className="bg-linear-to-b from-[#2563EB] to-[#101828] bg-clip-text text-transparent text-4xl md:text-6xl font-extrabold leading-tight">
              Find the right property on your own choices
            </h1>
          </div>

          {/* Form card */}
          <div className="w-full md:w-[480px]">
            <div className="bg-white rounded-3xl md:rounded-[32px] shadow-2xl p-6 md:p-10 border border-white">
              <p className="text-gray-400 text-sm mb-1">Welcome back</p>
              <h2 className="text-[#1d2567] text-xl md:text-2xl font-bold mb-6">
                <span className="text-[#F7AE49]">Sign in</span> to your Account
              </h2>

              <div
                role="tablist"
                className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={method === "mobile"}
                  onClick={() => switchMethod("mobile")}
                  className={tabClass("mobile")}
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile Number
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={method === "email"}
                  onClick={() => switchMethod("email")}
                  className={tabClass("email")}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {method === "mobile" ? (
                <form onSubmit={handlePhoneSubmit} noValidate>
                  <div className="mb-5">
                    <label
                      htmlFor="phone"
                      className="block text-gray-500 text-sm mb-2 font-medium"
                    >
                      Mobile Number
                    </label>
                    <div className="flex items-stretch border border-gray-200 rounded-lg bg-white focus-within:border-[#2D336B] transition-colors overflow-hidden">
                      <span className="flex items-center px-3 text-gray-700 bg-gray-50 border-r border-gray-200 text-sm font-medium">
                        +91
                      </span>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="10 digit mobile number"
                        value={phone}
                        disabled={otpSent}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                          setNoAccount(false);
                        }}
                        className="flex-1 min-w-0 px-4 py-3 outline-none text-gray-700 placeholder:text-gray-400 bg-white disabled:bg-gray-50"
                      />
                    </div>
                    {otpSent && (
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="text-gray-500">
                          We sent a 4 digit code to +91 {phone}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                            setError("");
                          }}
                          className="text-blue-500 hover:text-blue-700 font-medium shrink-0 ml-2"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  {noAccount && (
                    <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      No account found for this number.{" "}
                      <Link
                        href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
                        className="font-semibold underline"
                      >
                        Create an account
                      </Link>
                    </div>
                  )}

                  {otpSent && (
                    <div className="mb-6">
                      <label
                        htmlFor="otp"
                        className="block text-gray-500 text-sm mb-2 font-medium"
                      >
                        OTP
                      </label>
                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="• • • •"
                        autoFocus
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        className={`${inputClass} text-center text-xl tracking-[0.6em] font-semibold`}
                      />
                      <div className="text-right mt-2">
                        {resendIn > 0 ? (
                          <span className="text-sm text-gray-400">
                            Resend OTP in {resendIn}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={sendOtp}
                            disabled={isLoading}
                            className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`${primaryBtn} mb-6`}
                  >
                    {otpSent
                      ? submitLabel("Verify & Login", "Verifying...")
                      : submitLabel("Send OTP", "Sending...")}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEmailLogin}>
                  <div className="mb-5">
                    <label
                      htmlFor="email"
                      className="block text-gray-500 text-sm mb-2 font-medium"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="password"
                      className="block text-gray-500 text-sm mb-2 font-medium"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                    />
                    <div className="text-right mt-2">
                      <Link
                        href={`/forgot-password?redirect=${encodeURIComponent(redirectPath)}`}
                        className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`${primaryBtn} mb-6`}
                  >
                    {submitLabel("Login", "Signing in...")}
                  </button>
                </form>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium text-gray-400">OR</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-[#dbeafe] hover:bg-blue-100 disabled:bg-gray-100 text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-colors mb-6 md:mb-8"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="text-center">
                <span className="text-gray-400 text-sm">
                  Don&apos;t Have An Account?{" "}
                </span>
                <Link
                  href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
                  className="text-blue-500 font-medium text-sm hover:underline"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { AxiosError } from "axios";
import Header from "@/components/Header";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`;

  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await authApi.forgotPassword(email);
      startCooldown();
      setStep("reset");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(
        error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      setLoading(true);
      setError("");
      await authApi.forgotPassword(email);
      startCooldown();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await authApi.resetPassword({ email, otp, newPassword });
      setStep("done");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(
        error.response?.data?.message ||
          "Failed to reset password. Please check your OTP and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 font-sans text-gray-900 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#2D55FB]/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#2D55FB]/30 rounded-full blur-[100px] pointer-events-none" />

      <Header />

      <div className="flex-grow flex items-center justify-center p-4 relative z-10 w-full max-w-7xl mx-auto">
        <div className="w-full md:w-[480px] mx-auto">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-10 border border-white">
            {step === "done" ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-[#1d2567] text-2xl font-bold mb-2">
                  Password Reset
                </h2>
                <p className="text-gray-500 text-sm mb-8">
                  Your password has been reset successfully. You can now sign
                  in with your new password.
                </p>
                <button
                  onClick={() => router.push(loginHref)}
                  className="w-full bg-[#1d2567] hover:bg-[#151b4d] text-white font-bold py-3 rounded-lg shadow-sm transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-1">
                  {step === "email" ? "Trouble signing in?" : "Almost there"}
                </p>
                <h2 className="text-[#1d2567] text-2xl font-bold mb-8">
                  <span className="text-[#F7AE49]">Reset</span> your Password
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {step === "email" ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="mb-8">
                      <label className="block text-gray-500 text-sm mb-2 font-medium">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#2D336B] transition-colors text-gray-700 placeholder:text-gray-400 bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#1d2567] hover:bg-[#151b4d] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-sm transition-colors mb-6 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <p className="text-sm text-gray-500 mb-6">
                      We sent a 4-digit OTP to <strong>{email}</strong>.
                    </p>

                    <div className="mb-6">
                      <label className="block text-gray-500 text-sm mb-2 font-medium">
                        OTP
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="Enter 4-digit OTP"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#2D336B] transition-colors text-gray-700 placeholder:text-gray-400 bg-white tracking-widest"
                      />
                      <div className="text-right mt-2">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendCooldown > 0 || loading}
                          className="text-sm text-blue-500 hover:text-blue-700 font-medium disabled:text-gray-400"
                        >
                          {resendCooldown > 0
                            ? `Resend OTP in ${resendCooldown}s`
                            : "Resend OTP"}
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-500 text-sm mb-2 font-medium">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#2D336B] transition-colors text-gray-700 placeholder:text-gray-400 bg-white"
                      />
                    </div>

                    <div className="mb-8">
                      <label className="block text-gray-500 text-sm mb-2 font-medium">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#2D336B] transition-colors text-gray-700 placeholder:text-gray-400 bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#1d2567] hover:bg-[#151b4d] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-sm transition-colors mb-6 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center">
                  <Link
                    href={loginHref}
                    className="text-blue-500 font-medium text-sm hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

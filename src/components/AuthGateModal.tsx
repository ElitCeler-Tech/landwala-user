"use client";

import Link from "next/link";
import { LogIn, X } from "lucide-react";
import { useAuthGateStore } from "@/store/authGateStore";

export default function AuthGateModal() {
  const { isOpen, redirectPath, close } = useAuthGateStore();

  if (!isOpen) return null;

  const redirectQuery = `?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-in fade-in zoom-in duration-200">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 bg-[#1d2567] rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-9 h-9 text-white" strokeWidth={2} />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Sign in to continue
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          You need an account to do that. Log in or create one to continue.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={`/login${redirectQuery}`}
            onClick={close}
            className="w-full bg-[#1d2567] hover:bg-[#151b4d] text-white font-semibold py-3 rounded-xl shadow-sm transition-colors"
          >
            Log In
          </Link>
          <Link
            href={`/signup${redirectQuery}`}
            onClick={close}
            className="w-full border border-[#1d2567] text-[#1d2567] font-semibold py-3 rounded-xl hover:bg-[#1d2567]/5 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

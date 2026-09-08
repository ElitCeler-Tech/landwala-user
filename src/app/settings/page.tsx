"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

/**
 * Mirrors the app's Settings screen: three notification preferences plus the
 * account actions. The app keeps the toggles in SharedPreferences, so the web
 * equivalent is localStorage rather than a server call.
 */
const TOGGLES = [
  {
    key: "push_notifications",
    title: "Push Notifications",
    subtitle: "Receive push notifications for updates",
  },
  {
    key: "email_notifications",
    title: "Email Notifications",
    subtitle: "Receive email updates about your properties",
  },
  {
    key: "promo_notifications",
    title: "Promotional Notifications",
    subtitle: "Receive offers and promotional updates",
  },
] as const;

type ToggleKey = (typeof TOGGLES)[number]["key"];

function readPref(key: string, fallback = true) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();

  const [prefs, setPrefs] = useState<Record<ToggleKey, boolean>>({
    push_notifications: true,
    email_notifications: true,
    promo_notifications: true,
  });
  const [dialog, setDialog] = useState<"deactivate" | "delete" | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setPrefs({
      push_notifications: readPref("push_notifications"),
      email_notifications: readPref("email_notifications"),
      promo_notifications: readPref("promo_notifications"),
    });
  }, []);

  const setPref = (key: ToggleKey, value: boolean) => {
    setPrefs((current) => ({ ...current, [key]: value }));
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // Private browsing can block storage; the toggle still works this session.
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setReason("");
    setReasonError(false);
    setDeleteError(null);
  };

  const handleDeactivate = () => {
    logout();
    closeDialog();
    router.push("/login");
  };

  const handleDelete = async () => {
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    try {
      setDeleting(true);
      setDeleteError(null);
      await authApi.deleteAccount(reason.trim());
      logout();
      closeDialog();
      router.push("/");
    } catch (err) {
      console.error("Failed to delete account", err);
      setDeleteError("Could not delete your account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f9f9] font-sans text-gray-900">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/profile"
            aria-label="Back to profile"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-7 h-7 text-black" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-black">
            Settings
          </h1>
        </div>

        <h2 className="text-base font-semibold text-[#1d2567] mb-4">
          Notification Settings
        </h2>
        <div className="space-y-3 mb-10">
          {TOGGLES.map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{toggle.title}</p>
                <p className="text-sm text-gray-500">{toggle.subtitle}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[toggle.key]}
                aria-label={toggle.title}
                onClick={() => setPref(toggle.key, !prefs[toggle.key])}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  prefs[toggle.key] ? "bg-[#1d2567]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    prefs[toggle.key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-[#1d2567] mb-4">Account</h2>
        {!isAuthenticated ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
            Sign in to manage your account.
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setDialog("deactivate")}
              className="w-full rounded-xl border border-red-200 bg-white p-4 text-left hover:border-red-400 transition-colors"
            >
              <p className="font-medium text-red-600">Deactivate Account</p>
              <p className="text-sm text-gray-500">
                Your account will be temporarily disabled
              </p>
            </button>
            <button
              type="button"
              onClick={() => setDialog("delete")}
              className="w-full rounded-xl border border-red-200 bg-white p-4 text-left hover:border-red-400 transition-colors"
            >
              <p className="font-medium text-red-600">Delete Account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all data
              </p>
            </button>
          </div>
        )}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeDialog} />
          <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-6">
            {dialog === "deactivate" ? (
              <>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Deactivate Account
                </h3>
                <p className="text-gray-600 mb-6">
                  Your account will be temporarily disabled. You can reactivate
                  it by logging in again.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="px-5 py-2.5 font-medium text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeactivate}
                    className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white"
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  This action is permanent and cannot be undone.
                </p>
                <label
                  htmlFor="delete-reason"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Reason for deleting *
                </label>
                <textarea
                  id="delete-reason"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setReasonError(false);
                  }}
                  rows={3}
                  placeholder="Please tell us why you want to delete your account"
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-[#1d2567]"
                />
                {reasonError && (
                  <p className="mt-2 text-sm text-red-600">
                    Please provide a reason
                  </p>
                )}
                {deleteError && (
                  <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="px-5 py-2.5 font-medium text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
                  >
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

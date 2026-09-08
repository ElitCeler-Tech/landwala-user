"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  propertySubmissionApi,
  PropertySubmissionListItem,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return { label: "Pending", className: "bg-orange-50 text-orange-700" };
    case "approved":
      return { label: "Approved", className: "bg-green-50 text-green-700" };
    case "rejected":
      return { label: "Rejected", className: "bg-red-50 text-red-700" };
    default:
      return {
        label: status || "Unknown",
        className: "bg-gray-100 text-[#1d2567]",
      };
  }
}

export default function MyListingsPage() {
  const { isAuthenticated } = useAuthStore();
  const [submissions, setSubmissions] = useState<PropertySubmissionListItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setSubmissions(await propertySubmissionApi.listMine({ limit: 50 }));
        setError(false);
      } catch (err) {
        console.error("Failed to load submissions", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      setDeleting(true);
      await propertySubmissionApi.remove(confirmDeleteId);
      setSubmissions((current) =>
        current.filter((s) => s.id !== confirmDeleteId),
      );
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Failed to delete submission", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f9f9] font-sans text-gray-900">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/profile"
              aria-label="Back to profile"
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-7 h-7 text-black" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold text-black truncate">
              My Submissions
            </h1>
          </div>
          <Link
            href="/list-property"
            className="shrink-0 rounded-xl bg-[#1d2567] px-4 sm:px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#111a61] transition-colors"
          >
            List a property
          </Link>
        </div>

        {!isAuthenticated ? (
          <div className="rounded-2xl bg-white border border-gray-100 py-16 px-6 text-center">
            <p className="text-gray-500 mb-6">
              Sign in to see the properties you have submitted.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-xl bg-[#1d2567] px-8 py-3 font-semibold text-white"
            >
              Login
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#111a61] animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white border border-gray-100 py-16 text-center text-gray-500">
            Failed to load your submissions. Please try again later.
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 py-16 px-6 text-center">
            <p className="text-lg font-medium text-gray-600 mb-1">
              No submission available
            </p>
            <p className="text-sm text-gray-500">
              Start by submitting your first property
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {submissions.map((item) => {
              const status = statusStyle(item.status);
              return (
                <article
                  key={item.id}
                  className="rounded-2xl bg-white border border-gray-100 overflow-hidden flex flex-col"
                >
                  {item.imageUrls?.[0] && (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.title}
                      className="h-44 w-full object-cover"
                    />
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="font-semibold text-gray-900 min-w-0">
                        {item.title}
                      </h2>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <dl className="text-sm text-gray-600 space-y-1 mb-4">
                      {item.location && (
                        <div className="flex gap-2">
                          <dt className="text-gray-400">Location</dt>
                          <dd className="min-w-0 truncate">{item.location}</dd>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <dt className="text-gray-400">Size</dt>
                        <dd>
                          {item.size} {item.unit ?? ""}
                        </dd>
                      </div>
                      {item.price && (
                        <div className="flex gap-2">
                          <dt className="text-gray-400">Price</dt>
                          <dd>{item.price}</dd>
                        </div>
                      )}
                      {item.category && (
                        <div className="flex gap-2">
                          <dt className="text-gray-400">Category</dt>
                          <dd>{item.category}</dd>
                        </div>
                      )}
                    </dl>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="mt-auto inline-flex items-center gap-2 self-start text-sm font-semibold text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Property
            </h3>
            <p className="text-gray-600 mb-6">
              This listing will be removed permanently.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
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
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

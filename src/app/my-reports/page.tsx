"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { issueReportsApi, IssueReport } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

/** Same status vocabulary and colours the app's My Reports screen uses. */
function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return { label: "Pending", className: "bg-orange-50 text-orange-700" };
    case "in_progress":
      return { label: "In Progress", className: "bg-blue-50 text-blue-700" };
    case "resolved":
      return { label: "Resolved", className: "bg-green-50 text-green-700" };
    case "closed":
      return { label: "Closed", className: "bg-green-50 text-green-700" };
    default:
      return {
        label: status || "Unknown",
        className: "bg-gray-100 text-[#1d2567]",
      };
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyReportsPage() {
  const { isAuthenticated } = useAuthStore();
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setReports(await issueReportsApi.getMine());
        setError(false);
      } catch (err) {
        console.error("Failed to load reports", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  return (
    <main className="min-h-screen bg-[#f9f9f9] font-sans text-gray-900">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
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
              My Reports
            </h1>
          </div>
          <Link
            href="/report-issue"
            className="shrink-0 rounded-xl bg-[#1d2567] px-4 sm:px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#111a61] transition-colors"
          >
            Report a bug
          </Link>
        </div>

        {!isAuthenticated ? (
          <div className="rounded-2xl bg-white border border-gray-100 py-16 px-6 text-center">
            <p className="text-gray-500 mb-6">
              Sign in to see the reports you have raised.
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
            Failed to load your reports. Please try again later.
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 py-16 text-center text-gray-500">
            You have not raised any reports yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const status = statusStyle(report.status);
              const hasRemark = Boolean(report.adminRemark?.trim());
              return (
                <article
                  key={report.id}
                  className="rounded-2xl bg-white border border-gray-100 p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 min-w-0">
                      {report.title}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mb-3">
                    {formatDate(report.createdAt)}
                  </p>

                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {report.description}
                  </p>

                  {hasRemark && (
                    <div className="mt-4 flex gap-2 rounded-xl border border-[#1d2567]/20 bg-[#1d2567]/5 p-4">
                      <MessageSquare className="w-4 h-4 shrink-0 text-[#1d2567] mt-0.5" />
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-[#1d2567]">
                          Response from support:{" "}
                        </span>
                        {report.adminRemark}
                      </p>
                    </div>
                  )}

                  {report.imageUrls?.length > 0 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                      {report.imageUrls.map((url, index) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <img
                            src={url}
                            alt={`Report attachment ${index + 1}`}
                            className="h-24 w-32 rounded-xl object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

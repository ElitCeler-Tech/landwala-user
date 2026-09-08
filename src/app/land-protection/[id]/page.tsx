"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Loader2, MapPin, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  landProtectionApi,
  LandProtectionRequestDetail,
  LandProtectionComment,
  CustomerLandVisit,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  QUOTED: "bg-blue-50 text-blue-700 border-blue-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function LandProtectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [request, setRequest] = useState<LandProtectionRequestDetail | null>(
    null,
  );
  const [visits, setVisits] = useState<CustomerLandVisit[]>([]);
  const [comments, setComments] = useState<LandProtectionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [confirmingVisitId, setConfirmingVisitId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const loadAll = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [req, visitList, commentList] = await Promise.all([
        landProtectionApi.getRequestById(id),
        landProtectionApi.getInspectionVisits(id).catch(() => []),
        landProtectionApi.getComments(id).catch(() => []),
      ]);
      setRequest(req);
      setVisits(visitList);
      setComments(commentList);
      setError(false);
    } catch (err) {
      console.error("Failed to load land protection request", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Confirm that the customer reviewed this visit's approved media. The app
  // exposes the same action on its My Requests visit list.
  const handleConfirmVisit = async (visitId: string) => {
    if (!id) return;
    try {
      setConfirmingVisitId(visitId);
      const { customerConfirmedAt } = await landProtectionApi.confirmVisit(
        id,
        visitId,
      );
      setVisits((prev) =>
        prev.map((visit) =>
          visit.id === visitId ? { ...visit, customerConfirmedAt } : visit,
        ),
      );
    } catch (err) {
      console.error("Failed to confirm visit", err);
    } finally {
      setConfirmingVisitId(null);
    }
  };

  const handlePostComment = async () => {
    const message = commentText.trim();
    if (!message || !id) return;
    try {
      setPosting(true);
      const created = await landProtectionApi.addComment(id, message);
      setComments((prev) => [...prev, created]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="bg-gray-50 pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#111a61] transition-colors mb-8"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#111a61] animate-spin" />
            </div>
          ) : error || !request ? (
            <div className="text-center py-16 text-gray-500">
              Failed to load this request. Please try again later.
            </div>
          ) : (
            <>
              <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-8 md:p-10 relative overflow-hidden mb-8">
                <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#EF9E41] to-[#111a61]"></div>

                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {request.landLocation}
                    </h1>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      {request.location} - {request.pincode}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border ${
                      STATUS_STYLES[request.status] ??
                      "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {formatStatus(request.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Land Area</p>
                    <p className="font-semibold text-gray-800">
                      {request.landArea}
                    </p>
                  </div>
                  {request.planTitle && (
                    <div>
                      <p className="text-gray-400">Plan</p>
                      <p className="font-semibold text-gray-800">
                        {request.planTitle}
                        {request.planAmount != null &&
                          ` (₹${request.planAmount.toLocaleString()})`}
                      </p>
                    </div>
                  )}
                  {request.visitFrequency && (
                    <div>
                      <p className="text-gray-400">Visit Frequency</p>
                      <p className="font-semibold text-gray-800">
                        {formatStatus(request.visitFrequency)}
                      </p>
                    </div>
                  )}
                  {request.quotedAmount != null && (
                    <div>
                      <p className="text-gray-400">Quoted Amount</p>
                      <p className="font-semibold text-gray-800">
                        ₹{request.quotedAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400">Submitted On</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.adminNotes && (
                  <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-sm text-gray-700">
                    <span className="font-semibold text-[#111a61]">
                      Note from admin:{" "}
                    </span>
                    {request.adminNotes}
                  </div>
                )}
              </div>

              {visits.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-8 mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">
                    Inspection Visits
                  </h2>
                  <div className="space-y-8">
                    {visits.map((visit) => (
                      <div
                        key={visit.id}
                        className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0"
                      >
                        <p className="text-sm text-gray-500 mb-3">
                          Visited on{" "}
                          {new Date(visit.visitDate).toLocaleDateString()}
                        </p>
                        {visit.remarks && (
                          <p className="text-sm text-gray-700 mb-4">
                            {visit.remarks}
                          </p>
                        )}
                        {visit.photos.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {visit.photos.map((photo, i) => (
                              <div
                                key={i}
                                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                              >
                                <Image
                                  src={photo.imageUrl}
                                  alt={photo.category}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {visit.videoUrls?.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            {visit.videoUrls.map((url) => (
                              <video
                                key={url}
                                src={url}
                                controls
                                playsInline
                                className="w-full rounded-xl bg-black"
                              />
                            ))}
                          </div>
                        )}

                        <div className="mt-4">
                          {visit.customerConfirmedAt ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                              Reviewed on{" "}
                              {new Date(
                                visit.customerConfirmedAt,
                              ).toLocaleDateString()}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConfirmVisit(visit.id)}
                              disabled={confirmingVisitId === visit.id}
                              className="w-full sm:w-auto rounded-full bg-[#1d2567] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#151b4d] transition-colors disabled:opacity-60"
                            >
                              {confirmingVisitId === visit.id
                                ? "Confirming..."
                                : "Confirm Reviewed"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Comments
                </h2>

                {comments.length === 0 ? (
                  <p className="text-gray-400 text-sm mb-6">
                    No comments yet.
                  </p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">
                            {comment.user?.name || "You"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {comment.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !posting) handlePostComment();
                    }}
                    placeholder="Write a comment..."
                    maxLength={2000}
                    className="flex-1 border border-gray-200 rounded-xl px-5 py-3 text-gray-700 outline-none focus:border-[#111a61] transition-colors bg-white"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={posting || !commentText.trim()}
                    className="px-5 rounded-xl bg-[#111a61] text-white font-medium hover:bg-[#151b4d] disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {posting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

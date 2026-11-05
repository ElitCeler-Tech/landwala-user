"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import Footer from "@/components/Footer";
import {
  contentApi,
  landProtectionApi,
  FaqItem,
  LandProtectionVideo,
} from "@/lib/api";

/**
 * Land Protection walkthrough, mirroring the app's videos screen: an
 * admin-managed video carousel with skip/next, a Continue that hands off to
 * the quote form, and the land-protection FAQ list underneath.
 */
export default function LandProtectionVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<LandProtectionVideo[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GET /land-protection/videos needs a signed-in user, as in the app.
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=%2Fland-protection%2Fvideos");
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const items = await landProtectionApi.getVideos();
        setVideos([...items].sort((a, b) => a.displayOrder - b.displayOrder));
      } catch (err) {
        console.error("Failed to load land protection videos", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  useEffect(() => {
    const load = async () => {
      try {
        setFaqs(await contentApi.getFaqs("land-protection"));
      } catch {
        setFaqs([]);
      }
    };
    load();
  }, []);

  // Restart playback when the carousel moves, matching the app's behaviour of
  // pausing the outgoing video and playing the incoming one.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {
      // Autoplay can be blocked; the viewer can press play.
    });
  }, [current]);

  const isLast = current >= videos.length - 1;
  const goToForm = () => router.push("/land-protection-quote");
  const next = () => {
    if (isLast) goToForm();
    else setCurrent((c) => c + 1);
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/land-protection"
              aria-label="Back to Land Protection"
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-7 h-7 text-black" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold text-black truncate">
              How Land Protection works
            </h1>
          </div>
          <button
            type="button"
            onClick={goToForm}
            className="shrink-0 text-sm font-semibold text-[#1d2567] hover:text-orange-500"
          >
            Skip
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#111a61] animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 py-16 px-6 text-center">
            <p className="text-gray-500 mb-6">
              No walkthrough videos are available right now.
            </p>
            <button
              type="button"
              onClick={goToForm}
              className="rounded-xl bg-[#1d2567] px-8 py-3.5 font-semibold text-white"
            >
              Continue to quote
            </button>
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
              <video
                ref={videoRef}
                key={videos[current].id}
                src={videos[current].videoUrl}
                controls
                playsInline
                autoPlay
                muted
                onEnded={next}
                className="w-full h-full object-contain"
              />

              {videos.length > 1 && (
                <button
                  type="button"
                  aria-label="Next video"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            <p className="mt-4 text-center text-base sm:text-lg font-medium text-gray-900">
              {videos[current].title}
            </p>

            {videos.length > 1 && (
              <div
                className="mt-5 flex items-center justify-center gap-2"
                role="tablist"
                aria-label="Video progress"
              >
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    type="button"
                    role="tab"
                    aria-selected={index === current}
                    aria-label={`Video ${index + 1}`}
                    onClick={() => setCurrent(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === current
                        ? "w-6 bg-[#1d2567]"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-3">
              <button
                type="button"
                onClick={next}
                className="rounded-xl bg-[#1d2567] px-8 py-3.5 font-semibold text-white hover:bg-[#111a61] transition-colors"
              >
                {isLast ? "Continue to quote" : "Next"}
              </button>
              {!isLast && (
                <button
                  type="button"
                  onClick={goToForm}
                  className="rounded-xl border border-gray-200 px-8 py-3.5 font-semibold text-[#1d2567] hover:border-[#1d2567] transition-colors"
                >
                  Skip to quote
                </button>
              )}
            </div>
          </>
        )}

        {faqs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-[#1d2567] mb-5">
              FAQs: Land Protection
            </h2>
            <div className="space-y-3">
              {[...faqs]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((faq) => (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-gray-100 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaqId(openFaqId === faq.id ? null : faq.id)
                      }
                      className="w-full px-5 py-4 text-left font-semibold text-gray-900"
                    >
                      {faq.question}
                    </button>
                    {openFaqId === faq.id && (
                      <p className="px-5 pb-4 text-gray-600 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

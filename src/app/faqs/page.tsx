"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { contentApi, FaqItem } from "@/lib/api";

function FaqAccordionItem({ faq }: { faq: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
      >
        <span className="font-semibold text-gray-900">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-[#EF9E41] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-600 leading-relaxed whitespace-pre-line">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await contentApi.getFaqs();
        setFaqs(data);
        setError(false);
      } catch (err) {
        console.error("Failed to load FAQs", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(faqs.map((f) => f.category)));
    return ["All", ...unique];
  }, [faqs]);

  const visibleFaqs = useMemo(() => {
    const filtered =
      activeCategory === "All"
        ? faqs
        : faqs.filter((f) => f.category === activeCategory);
    return [...filtered].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [faqs, activeCategory]);

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="bg-gray-50 pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 md:text-lg">
              Answers to the questions we hear most often.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#111a61] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-gray-500">
              Failed to load FAQs. Please try again later.
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No FAQs available yet.
            </div>
          ) : (
            <>
              {categories.length > 1 && (
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                        activeCategory === cat
                          ? "bg-[#111a61] text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-[#111a61]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                {visibleFaqs.map((faq) => (
                  <FaqAccordionItem key={faq.id} faq={faq} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

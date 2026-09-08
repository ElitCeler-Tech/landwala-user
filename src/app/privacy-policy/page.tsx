"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { contentApi, LegalDocument, LegalDocumentType } from "@/lib/api";

function SectionBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const isContact = /contact/i.test(title);
  const isAcknowledgement = /acknowledg/i.test(title);

  if (isAcknowledgement) {
    return (
      <div className="pt-10 mt-10 border-t border-gray-100 flex justify-center">
        <p className="font-semibold text-center text-[#EF9E41] bg-orange-50 px-6 py-3 rounded-full whitespace-pre-line">
          {content}
        </p>
      </div>
    );
  }

  if (isContact) {
    return (
      <section className="bg-gray-50 p-8 rounded-2xl border border-gray-100 mt-12">
        <h2 className="text-2xl font-bold text-[#111a61] mb-4">{title}</h2>
        <p className="whitespace-pre-line">{content}</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-[#111a61] mb-4 bg-blue-50/50 p-3 rounded-xl border-l-4 border-[#111a61]">
        {title}
      </h2>
      <p className="whitespace-pre-line">{content}</p>
    </section>
  );
}

export default function PrivacyPolicy() {
  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await contentApi.getLegalDocument(
          LegalDocumentType.PRIVACY,
        );
        setDoc(data);
        setError(false);
      } catch (err) {
        console.error("Failed to load Privacy Policy", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sections = [...(doc?.sections ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />
      <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xs border border-gray-100 p-8 md:p-14 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#EF9E41] to-[#111a61]"></div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mb-12 font-medium">
            {doc?.lastUpdatedAt
              ? `Last Updated: ${new Date(doc.lastUpdatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`
              : "Last Updated: --"}
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-[#111a61] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-gray-500">
              Failed to load this page. Please try again later.
            </div>
          ) : (
            <div className="space-y-10 text-gray-700 leading-relaxed md:text-lg">
              {sections.map((section) => (
                <SectionBlock
                  key={section.id}
                  title={section.title}
                  content={section.content}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

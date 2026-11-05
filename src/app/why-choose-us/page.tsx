"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  CalendarClock,
  Sparkles,
  Fence,
  Paintbrush,
  Eye,
  Camera,
  Shield,
  FileText,
  Wrench,
  BadgeCheck,
  ClipboardCheck,
  Lock,
  Headset,
  FileSearch,
  Handshake,
  Users,
  Coins,
  ThumbsUp,
  Receipt,
  Gavel,
  LayoutGrid,
  CheckCircle2,
  Star,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { contentApi, WhyChooseItem } from "@/lib/api";

// Maps the fixed set of Material icon names the admin panel offers
// (see backend WHY_CHOOSE_ICONS) to a lucide-react equivalent.
const ICON_MAP: Record<string, LucideIcon> = {
  verified_user: ShieldCheck,
  calendar_month: CalendarClock,
  cleaning_services: Sparkles,
  fence: Fence,
  format_paint: Paintbrush,
  remove_red_eye: Eye,
  photo_camera: Camera,
  shield: Shield,
  description: FileText,
  home_repair_service: Wrench,
  verified: BadgeCheck,
  approval: ClipboardCheck,
  security: Lock,
  support_agent: Headset,
  fact_check: FileSearch,
  handshake: Handshake,
  visibility: Eye,
  people: Users,
  monetization_on: Coins,
  thumb_up: ThumbsUp,
  receipt_long: Receipt,
  gavel: Gavel,
  dashboard: LayoutGrid,
  shield_outlined: Shield,
  check_circle: CheckCircle2,
  group: Users,
  attach_money: Coins,
  star: Star,
};

export default function WhyChooseUsPage() {
  const [items, setItems] = useState<WhyChooseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await contentApi.getWhyChooseItems();
        setItems(data);
        setError(false);
      } catch (err) {
        console.error("Failed to load Why Choose Us items", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sections = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
    const grouped = new Map<string, WhyChooseItem[]>();
    for (const item of sorted) {
      const bucket = grouped.get(item.sectionTitle) ?? [];
      bucket.push(item);
      grouped.set(item.sectionTitle, bucket);
    }
    return Array.from(grouped.entries());
  }, [items]);

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="bg-gray-50 pt-28 pb-12 md:pt-32 md:pb-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Why Choose Us
            </h1>
            <p className="text-gray-500 md:text-lg max-w-2xl mx-auto">
              What makes LANDWALAA the trusted choice for buying, selling, and
              protecting land.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#111a61] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-gray-500">
              Failed to load this page. Please try again later.
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              Nothing to show yet.
            </div>
          ) : (
            <div className="space-y-16">
              {sections.map(([sectionTitle, sectionItems]) => (
                <div key={sectionTitle}>
                  <h2 className="text-2xl font-bold text-[#111a61] mb-8 text-center">
                    {sectionTitle}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectionItems.map((item) => {
                      const Icon = ICON_MAP[item.icon] ?? ShieldCheck;
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-3xl shadow-xs border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-shadow"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-[#111a61]/5 flex items-center justify-center mb-5">
                            <Icon className="w-7 h-7 text-[#EF9E41]" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

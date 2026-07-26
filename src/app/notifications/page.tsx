"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Bell, ChevronLeft, Loader2 } from "lucide-react";
import {
  notificationsApi,
  NotificationGroup,
  NotificationItem,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function routeForType(type: string): string {
  const t = type.toLowerCase();
  if (t === "wishlist") return "/wishlist";
  if (t === "land_protection" || t === "protection")
    return "/land-protection-quote";
  if (t === "loan" || t === "loan_eligibility") return "/check-loan-eligibility";
  // enquiry, property, price, task, property_submission, and any
  // unhandled type all fall back to the profile's requests view,
  // matching the app's "My Requests" fallback.
  return "/profile";
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await notificationsApi.getNotifications(50, 0);
        setGroups(data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, router]);

  const handleTap = (item: NotificationItem) => {
    setReadIds((prev) => new Set(prev).add(item.id));
    router.push(routeForType(item.type));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="grow container mx-auto px-4 md:px-6 py-28 max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-black" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Notifications
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#1d2567]" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Bell className="w-24 h-24 text-gray-200 mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              No Notifications Yet
            </h2>
            <p className="text-gray-500 max-w-md">
              You&apos;ll receive notifications about property updates,
              wishlist items, enquiry responses, and important alerts here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.date}>
                <p className="text-sm text-gray-500 mb-3 px-1">{group.date}</p>
                <div className="space-y-3">
                  {group.items.map((item) => {
                    const isRead = item.isRead || readIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTap(item)}
                        className={`w-full text-left rounded-lg p-4 flex items-start gap-3 transition-colors ${
                          isRead
                            ? "bg-gray-50"
                            : "bg-[#E8EDF5] border border-[#1d2567]/15"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-[#1d2567] flex items-center justify-center">
                            <Bell className="w-5 h-5 text-white" />
                          </div>
                          {!isRead && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm line-clamp-2 ${
                              isRead
                                ? "font-semibold text-gray-500"
                                : "font-bold text-[#515978]"
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.subtitle}
                          </p>
                          <p className="text-xs text-black mt-1">
                            {item.time}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

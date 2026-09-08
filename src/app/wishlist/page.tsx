"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import Image from "next/image";
import { Heart, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { wishlistApi, WishlistItem } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const WishlistCard = ({
  item,
  onRemove,
  removing,
}: {
  item: WishlistItem;
  onRemove: (id: string) => void;
  removing: boolean;
}) => {
  const isLayout = item.type === "LAYOUT" && item.layout;
  const isProperty = item.type === "PROPERTY" && item.property;

  const details = isLayout ? item.layout : item.property;

  if (!details) return null;

  const title = details.title;
  // Handle different data structures for layout vs property
  const location = isLayout
    ? (details as any).location
    : (details as any).locationAddress ||
      `${(details as any).city}, ${(details as any).state}`;

  const priceRange = details.priceRange;
  const image = isLayout
    ? (details as any).imageUrl
    : (details as any).images?.[0] || "/placeholder-image.jpg"; // Add fallback

  const typeLabel = isLayout ? "Layout" : "Property";
  const linkHref = isLayout
    ? `/layouts/${details.id}`
    : `/property-details/${details.id}`;

  return (
    <div className="bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row items-center gap-6 relative">
      {/* Image Container */}
      <div className="relative w-full md:w-[400px] h-64 md:h-56 shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover rounded-2xl"
          unoptimized
        />
        {/* Tapping the filled heart removes the item, as it does in the app. */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={removing}
          aria-label="Remove from wishlist"
          className="absolute bottom-3 right-3 text-red-500 hover:scale-110 transition-transform disabled:opacity-50 cursor-pointer"
        >
          {removing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Heart className="w-6 h-6 fill-current" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-start w-full">
        <h3 className="text-2xl font-bold text-[#1d2567] mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{location}</p>

        <p className="font-bold text-[#1d2567] text-lg">
          {typeLabel} | {priceRange}
        </p>
      </div>

      {/* Action Button */}
      <div className="hidden md:flex pr-6">
        <Link
          href={linkHref}
          className="w-12 h-12 bg-[#1d2567] rounded-full flex items-center justify-center text-white hover:bg-[#2e3675] transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </Link>
      </div>

      <div className="md:hidden w-full flex justify-end">
        <Link
          href={linkHref}
          className="w-12 h-12 bg-[#1d2567] rounded-full flex items-center justify-center text-white hover:bg-[#2e3675] transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
};

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=%2Fwishlist");
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await wishlistApi.get({ page: 1, limit: 100 });
        // The API returns { data: [], meta: {} }
        if (response && response.data) {
          setWishlistItems(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (wishlistItemId: string) => {
    setRemovingId(wishlistItemId);
    const previous = wishlistItems;
    setWishlistItems((current) =>
      current.filter((i) => i.id !== wishlistItemId),
    );
    try {
      await wishlistApi.removeById(wishlistItemId);
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);
      setWishlistItems(previous);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="grow container mx-auto px-4 md:px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-[#1d2567] mb-12">
          WishList
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#1d2567]" />
          </div>
        ) : wishlistItems.length > 0 ? (
          <div className="max-w-5xl mx-auto space-y-8">
            {wishlistItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                removing={removingId === item.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="w-64 h-64 relative mb-8">
              <Image
                src="/eligibility.svg"
                alt="No wishlist items"
                fill
                className="object-contain"
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              You haven&apos;t saved any properties yet.
            </h2>

            <p className="text-gray-500 text-lg mb-8 max-w-lg">
              Tap the{" "}
              <Heart className="inline w-5 h-5 text-red-500 fill-current mx-1 align-sub" />{" "}
              icon on a property to add it to your favourites.
            </p>

            <Link
              href="/properties"
              className="bg-[#1d2567] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#2e3675] transition-colors text-lg"
            >
              Browse Properties
            </Link>
          </div>
        )}
      </main>

      {/* Connect with us section */}
      <div className="-mb-16 relative z-20">
        <Contact />
      </div>

      <Footer />
    </div>
  );
}

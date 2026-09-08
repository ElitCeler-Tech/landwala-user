import Header from "@/components/Header";
import Banners from "@/components/Banners";
import Hero from "@/components/Hero";
import SearchSection from "@/components/SearchSection";
import Categories from "@/components/Categories";
import PropertiesSection from "@/components/PropertiesSection";
import QuickActions from "@/components/QuickActions";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

import DownloadApp from "@/components/DownloadApp";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />
      <Banners />
      <Hero />
      <SearchSection />
      <Categories id="categories" />
      <PropertiesSection id="properties" title="Explore Nearby Properties" />
      <QuickActions id="quick-actions" />
      <PropertiesSection title="Featured Listings" variant="featured" />

      {/* Discovery rails, in the same order the app shows them. Each hides
          itself when the backend returns nothing (or 401s, as recently-viewed
          does for signed-out visitors). */}
      <PropertiesSection
        title="Recently Viewed"
        tag="🕐 Recently Viewed"
        variant="recently-viewed"
        layout="rail"
        showViewAll={false}
      />
      <PropertiesSection
        title="Trending Properties"
        tag="📈 Trending"
        variant="trending"
        layout="rail"
        showViewAll={false}
      />
      <PropertiesSection
        title="Hot Sale"
        tag="🔥 Hot Sale"
        variant="hot-sale"
        layout="rail"
        showViewAll={false}
      />
      <PropertiesSection
        title="Most Viewed"
        tag="👁 Most Viewed"
        variant="most-viewed"
        layout="rail"
        showViewAll={false}
      />

      <Contact id="contact-us" />
      <DownloadApp />
      <Footer />
    </main>
  );
}

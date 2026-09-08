"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  UserCircle,
  FileText,
  Heart,
  ShieldCheck,
  Lock,
  AlertCircle,
  LogOut,
  Calendar,
  MapPin,
  Loader2,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Settings,
  ClipboardList,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  landRegistrationApi,
  LandRegistrationEnquiry,
  landProtectionApi,
  LandProtectionRequest,
  loanApi,
  LoanApplicationResponse,
  legalVerificationApi,
  LegalVerificationResponse,
  enquiriesApi,
  EnquiryListItem,
  issueReportsApi,
  wishlistApi,
  WishlistItem,
  Layout,
  Property,
} from "@/lib/api";

const WishlistCard = ({ item }: { item: WishlistItem }) => {
  const isLayout = item.type === "LAYOUT" && item.layout;
  const details = isLayout ? item.layout : item.property;

  if (!details) return null;

  const title = (details as Layout | Property).title;
  // Handle different data structures for layout vs property
  const location = isLayout
    ? (details as Layout).location
    : (details as Property).locationAddress ||
      `${(details as Property).city}, ${(details as Property).state}`;

  const priceRange = (details as Layout | Property).priceRange;
  const image = isLayout
    ? (details as Layout).imageUrl
    : (details as Property).images?.[0] || "/placeholder-image.jpg"; // Add fallback

  const typeLabel = isLayout ? "Layout" : "Property";
  const linkHref = isLayout
    ? `/layouts/${details.id}`
    : `/property-details/${details.id}`;

  return (
    <div className="bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row items-center gap-6 relative">
      {/* Image Container */}
      <div className="relative w-full md:w-[200px] h-48 md:h-36 shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover rounded-2xl"
          unoptimized
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-start w-full">
        <h3 className="text-xl font-bold text-[#1d2567] mb-2">{title}</h3>
        <p className="text-gray-500 mb-4 text-sm">{location}</p>

        <p className="font-bold text-[#1d2567] text-base">
          {typeLabel} | {priceRange}
        </p>
      </div>

      {/* Action Button */}
      <div className="hidden md:flex pr-6">
        <Link
          href={linkHref}
          className="w-10 h-10 bg-[#1d2567] rounded-full flex items-center justify-center text-white hover:bg-[#2e3675] transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="md:hidden w-full flex justify-end">
        <Link
          href={linkHref}
          className="w-10 h-10 bg-[#1d2567] rounded-full flex items-center justify-center text-white hover:bg-[#2e3675] transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("My Requests");
  const [subTab, setSubTab] = useState("Land protection");

  // Data states
  const [enquiries, setEnquiries] = useState<LandRegistrationEnquiry[]>([]);
  const [protectionRequests, setProtectionRequests] = useState<
    LandProtectionRequest[]
  >([]);
  const [loanApplications, setLoanApplications] = useState<
    LoanApplicationResponse[]
  >([]);
  const [legalVerifications, setLegalVerifications] = useState<
    LegalVerificationResponse[]
  >([]);
  const [plotEnquiries, setPlotEnquiries] = useState<EnquiryListItem[]>([]);
  const [layoutEnquiries, setLayoutEnquiries] = useState<EnquiryListItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Report Bug State
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState<File[]>([]);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "My Requests" && isAuthenticated) {
        setLoading(true);
        try {
          // Fetch based on subTab
          if (subTab === "Land protection") {
            const data = await landProtectionApi.getRequests();
            setProtectionRequests(data.requests || []);
          } else if (subTab === "Land Registration") {
            const data = await landRegistrationApi.getEnquiries();
            setEnquiries(data.enquiries || []);
          } else if (subTab === "Loan Eligibility") {
            const data = await loanApi.getApplications();
            setLoanApplications(data.applications || []);
          } else if (subTab === "Legal Verification") {
            const data = await legalVerificationApi.getApplications();
            setLegalVerifications(data.applications || []);
          } else if (subTab === "Plot Enquiry" || subTab === "Layouts") {
            // One /enquiries list serves both tabs, split by type as in the app.
            const items = await enquiriesApi.list({ page: 1, limit: 100 });
            setPlotEnquiries(items.filter((i) => i.type === "PROPERTY"));
            setLayoutEnquiries(items.filter((i) => i.type === "LAYOUT"));
          }
        } catch (err) {
          console.error(`Failed to fetch data for ${subTab}`, err);
        } finally {
          setLoading(false);
        }
      } else if (activeTab === "Wishlist" && isAuthenticated) {
        setLoading(true);
        try {
          const response = await wishlistApi.get({ page: 1, limit: 100 });
          if (response && response.data) {
            setWishlistItems(response.data);
          }
        } catch (err) {
          console.error("Failed to fetch wishlist", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [activeTab, subTab, isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReportImages(Array.from(e.target.files));
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      await issueReportsApi.submit({
        title: reportTitle,
        description: reportDescription,
        images: reportImages,
      });
      setReportSuccess(true);
      setReportTitle("");
      setReportDescription("");
      setReportImages([]);
      setTimeout(() => setReportSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to submit report", error);
    } finally {
      setReportSubmitting(false);
    }
  };

  const menuItems = [
    { icon: FileText, label: "My Requests" },
    { icon: Heart, label: "Wishlist" },
    { icon: ShieldCheck, label: "Terms of Use" },
    { icon: Lock, label: "Privacy Policy" },
    { icon: AlertCircle, label: "Report a Bug" },
    { icon: UserCircle, label: "Edit Profile" },
  ];

  const requestTabs = [
    "Land protection",
    "Layouts",
    "Land Registration",
    "Loan Eligibility",
    "Legal Verification",
    "Plot Enquiry",
  ];

  if (!mounted || !isAuthenticated || !user) {
    return null;
  }

  const renderRequestCard = (
    title: string,
    subtitle: string,
    footerText: string,
    id: string,
    detailHref?: string,
    payHref?: string,
  ) => (
    <div
      key={id}
      className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow mb-4"
    >
      <div className="mb-4">
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="border-t border-gray-100 my-4"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-sm text-gray-600 font-medium">{footerText}</span>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Out-of-range requests an admin has since approved can be paid for,
            matching the app's Pay Now action in My Requests. */}
        {payHref && (
          <button
            onClick={() => router.push(payHref)}
            className="bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            Pay Now
          </button>
        )}
        {detailHref ? (
          <button
            onClick={() => router.push(detailHref)}
            className="bg-[#1d2567] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#151b4d] transition-colors w-full sm:w-auto"
          >
            View Detail
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-200 text-gray-400 px-6 py-2.5 rounded-full text-sm font-medium w-full sm:w-auto cursor-not-allowed"
          >
            View Detail
          </button>
        )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1d2567]" />
        </div>
      );
    }

    switch (subTab) {
      case "Land protection":
        return protectionRequests.length > 0 ? (
          protectionRequests.map((req) =>
            renderRequestCard(
              req.landLocation || "Land Protection Request",
              `${req.landArea || "N/A"} . ${req.id.substring(0, 8)}`,
              `Submitted On ${new Date(req.createdAt).toLocaleDateString()}`,
              req.id,
              `/land-protection/${req.id}`,
              req.isOutOfRange && req.adminApproved
                ? `/land-protection-quote?fromRequest=${req.id}`
                : undefined,
            ),
          )
        ) : (
          <EmptyState message="No land protection requests found" />
        );

      case "Land Registration":
        return enquiries.length > 0 ? (
          enquiries.map((enq) =>
            renderRequestCard(
              enq.propertyTitle || "Land Registration Enquiry",
              `Ref: ${enq.id.substring(0, 8)}`,
              `Submitted On ${new Date(enq.createdAt).toLocaleDateString()}`,
              enq.id,
            ),
          )
        ) : (
          <EmptyState message="No land registration enquiries found" />
        );

      case "Loan Eligibility":
        return loanApplications.length > 0 ? (
          loanApplications.map((app) =>
            renderRequestCard(
              `${app.loanPurpose} Loan Application`,
              `Amount: ₹${app.desiredAmount?.toLocaleString()} . ${
                app.loanTenureYears
              } Years`,
              `Status: ${app.status}`,
              app.id,
            ),
          )
        ) : (
          <EmptyState message="No loan applications found" />
        );

      case "Legal Verification":
        return legalVerifications.length > 0 ? (
          legalVerifications.map((app) =>
            renderRequestCard(
              "Legal Verification Request",
              `Ref: ${app.id.substring(0, 8)}`,
              `Status: ${app.status}`,
              app.id,
            ),
          )
        ) : (
          <EmptyState message="No legal verification requests found" />
        );

      case "Plot Enquiry":
        return plotEnquiries.length > 0 ? (
          plotEnquiries.map((enq) =>
            renderRequestCard(
              enq.property?.title || "Plot Enquiry",
              enq.property?.locationAddress ||
                enq.property?.priceRange ||
                `Ref: ${enq.id.substring(0, 8)}`,
              `Submitted On ${new Date(enq.createdAt).toLocaleDateString()}`,
              enq.id,
              enq.property?.id
                ? `/property-details/${enq.property.id}`
                : undefined,
            ),
          )
        ) : (
          <EmptyState message="No plot enquiries found" />
        );

      case "Layouts":
        return layoutEnquiries.length > 0 ? (
          layoutEnquiries.map((enq) =>
            renderRequestCard(
              enq.layout?.title || "Layout Enquiry",
              enq.layout?.location || `Ref: ${enq.id.substring(0, 8)}`,
              `Submitted On ${new Date(enq.createdAt).toLocaleDateString()}`,
              enq.id,
              enq.layout?.id ? `/layouts/${enq.layout.id}` : undefined,
            ),
          )
        ) : (
          <EmptyState message="No layout enquiries found" />
        );

      default:
        return <EmptyState message={`${subTab} requests coming soon`} />;
    }
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <FileText className="w-16 h-16 mb-4 opacity-50" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 pt-32 pb-8 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-r border-gray-100 flex flex-col">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                My profile
              </h2>
            </div>

            <nav className="flex-grow">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === item.label
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {activeTab === item.label && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1d2567]"></div>
                  )}
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}

              {/* Plan card, as shown in the app's profile. There is no
                  per-user active-plan endpoint yet, so this points at the
                  Land Protection purchase flow. */}
              <div className="mx-4 my-3 rounded-xl bg-gradient-to-r from-[#1d2567] to-[#000a58] p-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 shrink-0 text-white" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Your Plan</p>
                  <p className="text-xs text-white/70">No active plan</p>
                </div>
                <Link
                  href="/land-protection"
                  className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#1d2567]"
                >
                  Upgrade
                </Link>
              </div>

              {/* Pages the app reaches from its profile menu. These are real
                  routes rather than tabs, so they navigate. */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                {[
                  {
                    icon: ClipboardList,
                    label: "My Reports",
                    href: "/my-reports",
                  },
                  { icon: HelpCircle, label: "FAQs", href: "/faqs" },
                  {
                    icon: Sparkles,
                    label: "Why Choose Us",
                    href: "/why-choose-us",
                  },
                  { icon: Settings, label: "Settings", href: "/settings" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-4"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-grow p-8 md:p-12">
            {activeTab === "Edit Profile" && (
              <div className="max-w-2xl">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-10">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400">
                        <UserCircle className="w-full h-full" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.fullName || user.name || "User"}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                      Enter your name
                    </label>
                    <div className="w-full bg-[#f0f2f5] border border-[#1d2567] rounded-lg px-4 py-3 text-gray-900">
                      {user.fullName || user.name || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                      Enter your Gender
                    </label>
                    <div className="w-full bg-[#f0f2f5] rounded-lg px-4 py-3 text-gray-900">
                      Male
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                      Location
                    </label>
                    <div className="w-full bg-[#f0f2f5] rounded-lg px-4 py-3 text-gray-900 flex justify-between items-center">
                      <span>{user.location || "N/A"}</span>
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                      Enter your Email Id
                    </label>
                    <div className="w-full bg-[#f0f2f5] rounded-lg px-4 py-3 text-gray-900">
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                      Enter your Birthday
                    </label>
                    <div className="w-full bg-[#f0f2f5] rounded-lg px-4 py-3 text-gray-900 flex justify-between items-center">
                      <span>18/03/2001</span>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                      Enter your Phone number
                    </label>
                    <div className="w-full bg-[#f0f2f5] rounded-lg px-4 py-3 text-gray-900 flex items-center gap-3">
                      <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                        <span className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                          <div className="w-full h-1/3 bg-[#FF9933]"></div>
                          <div className="w-full h-1/3 bg-white"></div>
                          <div className="w-full h-1/3 bg-[#138808]"></div>
                        </span>
                        <span className="text-gray-500 text-sm">
                          {user.countryCode || "+91"}
                        </span>
                      </div>
                      <span>{user.phoneNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "My Requests" && (
              <div className="w-full">
                {/* Sub-tabs Navigation */}
                <div className="flex overflow-x-auto border-b border-gray-200 mb-6 no-scrollbar">
                  {requestTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSubTab(tab)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                        subTab === tab
                          ? "text-[#1d2567]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                      {subTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d2567]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="space-y-4">{renderContent()}</div>
              </div>
            )}

            {activeTab === "Report a Bug" && (
              <div className="max-w-2xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Report a Bug
                </h3>

                {reportSuccess && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      Thank you for your report! We will look into it.
                    </span>
                  </div>
                )}

                <form onSubmit={handleReportSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Title
                    </label>
                    <input
                      type="text"
                      required
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full bg-[#f0f2f5] border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1d2567]"
                      placeholder="Brief summary of the issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      rows={5}
                      className="w-full bg-[#f0f2f5] border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1d2567]"
                      placeholder="Please describe what happened..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Screenshots (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center">
                        <FileText className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          {reportImages.length > 0
                            ? `${reportImages.length} file(s) selected`
                            : "Click or drag to upload screenshots"}
                        </span>
                      </div>
                    </div>
                    {reportImages.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {reportImages.map((file, idx) => (
                          <span key={idx} className="block truncate">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="bg-[#1d2567] text-white px-8 py-3 rounded-full font-medium hover:bg-[#151b4d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {reportSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "Wishlist" && (
              <div className="w-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  My Wishlist
                </h3>
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1d2567]" />
                  </div>
                ) : wishlistItems.length > 0 ? (
                  <div className="space-y-4">
                    {wishlistItems.map((item) => (
                      <WishlistCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Heart className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      Your wishlist is empty
                    </p>
                    <Link
                      href="/properties"
                      className="mt-4 text-[#1d2567] font-medium hover:underline"
                    >
                      Browse Properties
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab !== "Edit Profile" &&
              activeTab !== "My Requests" &&
              activeTab !== "Report a Bug" &&
              activeTab !== "Wishlist" && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {activeTab} section coming soon
                  </p>
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}

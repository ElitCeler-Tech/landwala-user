import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

// Create axios instance with base URL
const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://apilandwala.landwalaa.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface SubscriptionOrderResponse {
  payment_session_id?: string;
  paymentSessionId?: string;
  order_id?: string;
  orderId?: string;
  cf_order_id?: string; // Sometimes returned as cf_order_id
}

export interface SubscriptionVerifyResponse {
  status: string;
  message?: string;
}

/** Matches the backend SubscriptionPlanResponseDto. */
export interface SubscriptionPlan {
  id: string;
  title: string;
  /** Feature bullets; the backend stores them as a string array. */
  description: string[];
  price: number;
  durationMonths: number;
  isActive: boolean;
  minSqYards: number | null;
  maxSqYards: number | null;
}

export const subscriptionPurchaseApi = {
  getPlans: async (): Promise<{ data: SubscriptionPlan[] }> => {
    const response = await api.get("/subscription-plans", {
      params: { page: 1, limit: 10 },
    });
    return response.data;
  },

  createOrder: async (subscriptionPlanId: string) => {
    try {
      const response = await api.post("/subscription-purchase/order", {
        subscriptionPlanId,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Create Order Failed:",
          JSON.stringify(error.response?.data || error.message, null, 2),
        );
      } else {
        console.error("Create Order Failed:", error);
      }
      throw error;
    }
  },

  verifyOrder: async (orderId: string) => {
    const response = await api.get(
      `/subscription-purchase/verify?order_id=${orderId}`,
    );
    return response.data;
  },
};

// Generic Payments API (used for Land Protection's size-based plan payments,
// which are NOT subscription plans - see paymentsApi vs subscriptionPurchaseApi)
export interface CreatePaymentOrderResponse {
  orderId: string;
  paymentSessionId: string;
  orderAmount: number;
  orderCurrency: string;
}

export interface VerifyPaymentResponse {
  orderId: string;
  orderStatus: string;
  orderAmount: number;
}

export const paymentsApi = {
  createOrder: async (
    amount: number,
    note?: string,
    /** The land protection request this order settles, so verification can
     *  mark it paid server side rather than trusting the browser. */
    landProtectionId?: string,
  ): Promise<CreatePaymentOrderResponse> => {
    const response = await api.post("/payments/order", {
      amount,
      note,
      landProtectionId,
    });
    return response.data;
  },

  verifyPayment: async (orderId: string): Promise<VerifyPaymentResponse> => {
    const response = await api.get("/payments/verify", {
      params: { order_id: orderId },
    });
    return response.data;
  },
};

// Pincode serviceability API
export const pincodeApi = {
  getAllServiceable: async (): Promise<Set<string>> => {
    const codes = new Set<string>();
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const response = await api.get("/pincodes", {
        params: { page, limit: 100 },
      });
      totalPages = response.data?.totalPages ?? 1;
      const items: { pincode?: string }[] = response.data?.items ?? [];
      items.forEach((item) => {
        if (item.pincode) codes.add(item.pincode);
      });
      page++;
    }
    return codes;
  },
};

// Land Protection size-based pricing plans, frozen in sync with
// landwalaa-user's land_pricing_screen.dart
export interface LandPricingPlan {
  name: string;
  range: string;
  mrp: number;
  offer: number;
  features: string[];
}

export const LAND_PRICING_PLANS: LandPricingPlan[] = [
  {
    name: "Basic",
    range: "100 – 300 Sq. Yards",
    mrp: 18999,
    offer: 16569,
    features: [
      "Monthly on-ground inspection & photo report",
      "Boundary verification & encroachment alerts",
      "Dedicated support via call & WhatsApp",
    ],
  },
  {
    name: "Premium",
    range: "300 – 600 Sq. Yards",
    mrp: 24999,
    offer: 21999,
    features: [
      "Bi-monthly site visits with video documentation",
      "Legal compliance check & dispute prevention",
      "Priority support with dedicated land advisor",
    ],
  },
  {
    name: "Premium Plus",
    range: "600 – 1000+ Sq. Yards",
    mrp: 29999,
    offer: 26999,
    features: [
      "Weekly monitoring with drone/photo survey",
      "Full legal & compliance support with documentation",
      "24/7 dedicated advisor & emergency response",
    ],
  },
];

export function convertToSqYards(value: number, unit: string): number {
  switch (unit) {
    case "Sq. Yards":
      return value;
    case "Sq. Meters":
      return value * 1.19;
    case "Guntas":
      return value * 121;
    case "Acres":
      return -1;
    default:
      return value;
  }
}

export function getPlanForSqYards(sqYards: number): LandPricingPlan | null {
  if (sqYards < 100) return null;
  if (sqYards <= 300) return LAND_PRICING_PLANS[0];
  if (sqYards <= 600) return LAND_PRICING_PLANS[1];
  return LAND_PRICING_PLANS[2];
}

/**
 * Whether an admin-configured plan covers this land size. A null bound is
 * unbounded on that side, and a plan with no range set matches everything,
 * matching PlanModel.coversSqYards in the app.
 */
function planCoversSqYards(plan: SubscriptionPlan, sqYards: number): boolean {
  if (plan.minSqYards != null && sqYards < plan.minSqYards) return false;
  if (plan.maxSqYards != null && sqYards > plan.maxSqYards) return false;
  return true;
}

function describeRange(plan: SubscriptionPlan): string {
  const { minSqYards: min, maxSqYards: max } = plan;
  if (min != null && max != null) return `${min} to ${max} Sq. Yards`;
  if (min != null) return `${min}+ Sq. Yards`;
  if (max != null) return `Up to ${max} Sq. Yards`;
  return "All land sizes";
}

/**
 * The plan for a given land size, taken from the admin-managed
 * GET /subscription-plans so the site and the app quote the same price.
 * Falls back to the built-in LAND_PRICING_PLANS if that call fails or the
 * admin has not configured any plan covering this size.
 */
export async function resolvePlanForSqYards(
  sqYards: number,
): Promise<LandPricingPlan | null> {
  try {
    const response = await subscriptionPurchaseApi.getPlans();
    const active = (response.data ?? []).filter((p) => p.isActive !== false);
    const match = active.find((p) => planCoversSqYards(p, sqYards));
    if (match) {
      return {
        name: match.title,
        range: describeRange(match),
        mrp: match.price,
        offer: match.price,
        features: Array.isArray(match.description) ? match.description : [],
      };
    }
  } catch (error) {
    console.error("Falling back to built-in pricing plans", error);
  }
  return getPlanForSqYards(sqYards);
}

export function exceedsMaxLandSize(size: number, unit: string): boolean {
  const u = unit.toLowerCase();
  if (u.includes("gunta") && size >= 10) return true;
  if (u.includes("yard") && size >= 1200) return true;
  if (u.includes("acre") && size >= 1) return true;
  if (u.includes("meter") && size >= 1003) return true;
  return false;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = useAuthStore.getState().tokens;
    if (tokens?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // A 401 here means either a stale/expired session token, or (now that
    // browse endpoints are public) a genuinely anonymous request to an
    // action endpoint. Either way, clear any stale auth state, but don't
    // force-navigate -- that used to hard-redirect every page (including
    // pure browsing pages) to /login on any background 401. Call sites
    // that require auth should gate with useRequireAuth() before calling,
    // and the AuthGateModal handles prompting the user to sign in.
    if (error.response?.status === 401 && useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default api;

interface GoogleAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profilePicture: string;
    isNewUser: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    fullName: string;
    phoneNumber: string;
    countryCode: string;
    location: string;
    employment: string;
    occupationOther?: string;
    gender?: string;
    dateOfBirth?: string;
  };
  message?: string;
}

export interface LoanApplicationData {
  fullName: string;
  monthlyIncome: string;
  employmentType: string;
  loanPurpose: string;
  desiredAmount: string;
  loanTenureYears: string;
  documents: File[];
}

export interface LoanDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface LoanApplicationResponse {
  id: string;
  fullName: string;
  monthlyIncome: number;
  employmentType: string;
  loanPurpose: string;
  desiredAmount: number;
  loanTenureYears: number;
  status: string;
  remarks?: string | null;
  documents: LoanDocument[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface LoanApplicationsListResponse {
  applications: LoanApplicationResponse[];
  total: number;
  page: number;
  limit: number;
}

export const authApi = {
  googleAuth: async (idToken: string): Promise<GoogleAuthResponse> => {
    const response = await api.post("/auth/google", { idToken });
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<GoogleAuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  signup: async (credentials: {
    email: string;
    password: string;
    /** Supplying this sends the verification OTP by SMS as well as email,
     *  and keeps the number on the account. */
    phoneNumber?: string;
    countryCode?: string;
  }): Promise<{ message: string }> => {
    const response = await api.post("/auth/signup", credentials);
    return response.data;
  },

  verifyOtp: async (data: {
    email: string;
    otp: string;
  }): Promise<{ message: string }> => {
    const response = await api.post("/auth/verify-otp", data);
    return response.data;
  },

  resendOtp: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  register: async (userData: {
    fullName: string;
    phoneNumber: string;
    countryCode: string;
    location: string;
    employment: string;
    occupationOther?: string;
    gender: string;
    dateOfBirth: string;
  }): Promise<RegisterResponse> => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const response = await api.patch("/auth/me", data);
    return response.data;
  },

  /** Permanently delete the signed-in account. Mirrors the app's Settings screen. */
  deleteAccount: async (reason: string) => {
    const response = await api.delete("/auth/account", { data: { reason } });
    return response.data;
  },
};

export const loanApi = {
  apply: async (
    data: LoanApplicationData,
  ): Promise<LoanApplicationResponse> => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("monthlyIncome", data.monthlyIncome.toString());
    formData.append("employmentType", data.employmentType);
    formData.append("loanPurpose", data.loanPurpose);
    formData.append("desiredAmount", data.desiredAmount.toString());
    formData.append("loanTenureYears", data.loanTenureYears.toString());

    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((file) => {
        formData.append("documents", file);
      });
    }

    const response = await api.post("/loan/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getApplications: async (): Promise<LoanApplicationsListResponse> => {
    const response = await api.get("/loan/applications");
    return response.data;
  },

  getApplicationById: async (id: string): Promise<LoanApplicationResponse> => {
    const response = await api.get(`/loan/applications/${id}`);
    return response.data;
  },
};

export interface LegalVerificationData {
  titleDeed: File | null;
  saleAgreement: File | null;
  taxReceipt: File | null;
  encumbranceCertificate: File | null;
}

export interface LegalVerificationDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface LegalVerificationResponse {
  id: string;
  status: string;
  remarks?: string | null;
  titleDeed?: LegalVerificationDocument | null;
  saleAgreement?: LegalVerificationDocument | null;
  taxReceipt?: LegalVerificationDocument | null;
  encumbranceCertificate?: LegalVerificationDocument | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface LegalVerificationListResponse {
  applications: LegalVerificationResponse[];
  total: number;
  page: number;
  limit: number;
}

export const legalVerificationApi = {
  apply: async (
    data: LegalVerificationData,
  ): Promise<LegalVerificationResponse> => {
    const formData = new FormData();

    if (data.titleDeed) {
      formData.append("titleDeed", data.titleDeed);
    }
    if (data.saleAgreement) {
      formData.append("saleAgreement", data.saleAgreement);
    }
    if (data.taxReceipt) {
      formData.append("taxReceipt", data.taxReceipt);
    }
    if (data.encumbranceCertificate) {
      formData.append("encumbranceCertificate", data.encumbranceCertificate);
    }

    const response = await api.post("/legal-verification/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getApplications: async (): Promise<LegalVerificationListResponse> => {
    const response = await api.get("/legal-verification/applications");
    return response.data;
  },

  getApplicationById: async (
    id: string,
  ): Promise<LegalVerificationResponse> => {
    const response = await api.get(`/legal-verification/applications/${id}`);
    return response.data;
  },
};

export interface LandRegistrationEnquiry {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  status: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandRegistrationEnquiriesResponse {
  enquiries: LandRegistrationEnquiry[];
  total: number;
  page: number;
  limit: number;
}

export interface LandRegistrationSubmitData {
  name: string;
  phone: string;
  countryCode: string;
  email: string;
  location: string;
  plotType: string;
  message?: string;
}

export const landRegistrationApi = {
  submit: async (
    data: LandRegistrationSubmitData,
  ): Promise<LandRegistrationEnquiry> => {
    const response = await api.post("/land-registration/submit", data);
    return response.data;
  },

  getEnquiries: async (): Promise<LandRegistrationEnquiriesResponse> => {
    const response = await api.get("/land-registration/enquiries");
    return response.data;
  },
};

// Land Protection API Types
export const LAND_AREA_UNITS = ["Sq. Yards", "Sq. Meters", "Guntas", "Acres"];

export interface LandProtectionRequestData {
  fullName: string;
  phone: string;
  countryCode: string;
  landLocation: string;
  landArea: string;
  location: string;
  pincode: string;
  surveyNumbers?: string[];
  isOutOfRange?: boolean;
  planTitle?: string;
  planAmount?: number;
  /** The customer's own layout photo and dimension page, if supplied. */
  landLayout?: File | null;
  landDimension?: File | null;
}

export interface LandProtectionRequest {
  id: string;
  fullName: string;
  phone: string;
  countryCode: string;
  landLocation: string;
  landArea: string;
  location: string;
  pincode: string;
  status: string;
  /** Submitted without payment because the pincode was outside service range. */
  isOutOfRange: boolean;
  /** Set when an admin has since agreed to service it, which unlocks payment. */
  adminApproved: boolean;
  adminApprovedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Full detail shape returned by GET /land-protection/requests/:id
export interface LandProtectionRequestDetail extends LandProtectionRequest {
  surveyNumbers?: string[];
  latitude: number | null;
  longitude: number | null;
  quotedAmount: number | null;
  quoteSentAt: string | null;
  visitFrequency: string | null;
  planTitle: string | null;
  planAmount: number | null;
  imageUrls?: string[];
  layoutUrl?: string | null;
  userLayoutUrl?: string | null;
  dimensionPageUrl?: string | null;
  adminNotes: string | null;
  isOutOfRange: boolean;
  adminApproved: boolean;
  adminApprovedAt: string | null;
}

export interface LandProtectionCommentUser {
  id: string;
  name: string | null;
}

export interface LandProtectionComment {
  id: string;
  landProtectionId: string;
  message: string;
  createdAt: string;
  user?: LandProtectionCommentUser;
}

export interface CustomerVisitPhoto {
  category: string;
  imageUrl: string;
  capturedAt: string;
}

export interface CustomerLandVisit {
  id: string;
  visitDate: string;
  encroachment: boolean | null;
  boundaryCondition: string | null;
  illegalConstruction: boolean | null;
  remarks: string | null;
  photos: CustomerVisitPhoto[];
  videoUrls: string[];
  /** Set once the customer has confirmed they reviewed this visit's media. */
  customerConfirmedAt: string | null;
}

export interface LandProtectionRequestsResponse {
  requests: LandProtectionRequest[];
  total: number;
  page: number;
  limit: number;
}

export const landProtectionApi = {
  requestQuote: async (
    data: LandProtectionRequestData,
  ): Promise<LandProtectionRequest> => {
    // Always multipart: the backend reads landLayout and landDimension as
    // file fields, and a JSON body silently drops them, which is why the
    // customer's documents never reached admin.
    const formData = new FormData();
    const { landLayout, landDimension, surveyNumbers, ...rest } = data;

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    // Repeated field name, which is how the backend's array validation reads it.
    surveyNumbers?.forEach((n) => formData.append("surveyNumbers", n));
    if (landLayout) formData.append("landLayout", landLayout);
    if (landDimension) formData.append("landDimension", landDimension);

    const response = await api.post(
      "/land-protection/request-quote",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  getRequests: async (): Promise<LandProtectionRequestsResponse> => {
    const response = await api.get("/land-protection/requests");
    return response.data;
  },

  getRequestById: async (id: string): Promise<LandProtectionRequestDetail> => {
    const response = await api.get(`/land-protection/requests/${id}`);
    return response.data;
  },

  getInspectionVisits: async (id: string): Promise<CustomerLandVisit[]> => {
    const response = await api.get(
      `/land-protection/requests/${id}/inspection-visits`,
    );
    return response.data;
  },

  getComments: async (id: string): Promise<LandProtectionComment[]> => {
    const response = await api.get(`/land-protection/requests/${id}/comments`);
    return response.data;
  },

  addComment: async (
    id: string,
    message: string,
  ): Promise<LandProtectionComment> => {
    const response = await api.post(
      `/land-protection/requests/${id}/comments`,
      { message },
    );
    return response.data;
  },

  /** Confirm the customer reviewed a visit's media. Idempotent server side. */
  confirmVisit: async (
    requestId: string,
    visitId: string,
  ): Promise<{ customerConfirmedAt: string }> => {
    const response = await api.post(
      `/land-protection/requests/${requestId}/inspection-visits/${visitId}/confirm`,
    );
    return response.data;
  },

  getVideos: async (): Promise<LandProtectionVideo[]> => {
    const response = await api.get("/land-protection/videos", {
      params: { limit: 20 },
    });
    return response.data?.items ?? [];
  },
};

export interface LandProtectionVideo {
  id: string;
  videoUrl: string;
  title: string;
  displayOrder: number;
}

// Content Management API Types (admin-editable: FAQs, Why Choose Us, Terms/Privacy)
export enum LegalDocumentType {
  TERMS = "TERMS",
  PRIVACY = "PRIVACY",
}

export interface LegalDocumentSection {
  id: string;
  documentType: LegalDocumentType;
  title: string;
  content: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LegalDocument {
  documentType: LegalDocumentType;
  lastUpdatedAt: string | null;
  sections: LegalDocumentSection[];
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface WhyChooseItem {
  id: string;
  sectionTitle: string;
  icon: string;
  title: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const contentApi = {
  getLegalDocument: async (
    documentType: LegalDocumentType,
  ): Promise<LegalDocument> => {
    const response = await api.get("/legal-documents", {
      params: { documentType },
    });
    return response.data;
  },

  getFaqs: async (category?: string): Promise<FaqItem[]> => {
    const response = await api.get("/faqs", { params: { category } });
    return response.data;
  },

  getWhyChooseItems: async (): Promise<WhyChooseItem[]> => {
    const response = await api.get("/why-choose-items");
    return response.data;
  },

  /**
   * Admin-managed filter groups used by the buy/explore filters.
   * Shape: { property_type: [{ value, minValue, maxValue }], ... }
   */
  getFilterOptions: async (): Promise<FilterOptionGroups> => {
    const response = await api.get("/filter-options");
    return response.data;
  },
};

export interface FilterOption {
  value: string;
  minValue: number | null;
  maxValue: number | null;
}

export type FilterOptionGroups = Record<string, FilterOption[]>;

// Explore Categories (admin-managed tiles shown on the app's explore screen)
export interface ExploreCategory {
  id: string;
  name: string;
  iconKey: string | null;
  displayOrder: number;
  isActive: boolean;
}

export const exploreCategoriesApi = {
  list: async (): Promise<ExploreCategory[]> => {
    const response = await api.get("/explore-categories", {
      params: { limit: 50 },
    });
    return response.data?.data ?? [];
  },
};

// Properties API Types
export interface PropertyOverviewField {
  id: string;
  label: string;
  value: string;
  icon: string | null;
  displayOrder: number;
}

export interface Property {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  priceUnit: string;
  minPriceUnit: string;
  maxPriceUnit: string;
  priceRange: string;
  locationAddress: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  images: string[];
  brochureUrl: string;
  landLayoutTitle: string;
  landLayoutImageUrl: string;
  descriptionTitle: string;
  descriptionContent: string;
  overviewFields: PropertyOverviewField[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertiesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PropertiesResponse {
  data: Property[];
  meta: PropertiesMeta;
}

/** Filters accepted by GET /properties (mirrors the backend PropertyQueryDto). */
export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  pincode?: string;
  minPrice?: number;
  maxPrice?: number;
  plotSize?: string;
  propertyType?: string;
  /** Comma separated when more than one facing is selected. */
  facing?: string;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const propertiesApi = {
  getProperties: async (
    params?: PropertyQueryParams,
  ): Promise<PropertiesResponse> => {
    const response = await api.get("/properties", { params });
    return response.data;
  },

  getPropertyById: async (id: string): Promise<Property> => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  getLatestListings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PropertiesResponse> => {
    const response = await api.get("/properties/latest-listings", { params });
    return response.data;
  },

  getLatestListingById: async (id: string): Promise<Property> => {
    const response = await api.get(`/properties/latest-listings/${id}`);
    return response.data;
  },

  getFeaturedListings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PropertiesResponse> => {
    const response = await api.get("/properties/featured-listings", { params });
    return response.data;
  },

  // Home-page discovery rails. These mirror the four PropertySectionSlider
  // rows the Flutter app shows under the featured listings.
  getRecentlyViewed: async (limit = 10): Promise<PropertiesResponse> => {
    const response = await api.get("/properties/recently-viewed", {
      params: { limit },
    });
    return response.data;
  },

  getMostViewed: async (limit = 10): Promise<PropertiesResponse> => {
    const response = await api.get("/properties/most-viewed", {
      params: { limit },
    });
    return response.data;
  },

  getTrending: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PropertiesResponse> => {
    const response = await api.get("/properties/trending", { params });
    return response.data;
  },

  getHotSale: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PropertiesResponse> => {
    const response = await api.get("/properties/hot-sale", { params });
    return response.data;
  },

  /**
   * Record a property view. Feeds both the "Recently Viewed" rail (per user)
   * and the viewCount that "Most Viewed" sorts on. Fire-and-forget: a failure
   * here must never block the detail page from rendering.
   */
  trackView: async (id: string): Promise<void> => {
    try {
      await api.post(`/properties/${id}/view`);
    } catch {
      // ignore - view tracking is best effort
    }
  },
};

// Enquiries API Types
export interface EnquiryData {
  type: "PROPERTY" | "LAYOUT" | "GENERAL";
  propertyId?: string;
  layoutId?: string;
  slotId?: string;
  message: string;
}

export interface EnquiryResponse {
  id: string;
  type: string;
  propertyId?: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** One row of GET /enquiries, with the property or layout it refers to. */
export interface EnquiryListItem {
  id: string;
  type: "PROPERTY" | "LAYOUT" | "GENERAL";
  message?: string;
  status?: string;
  createdAt: string;
  property?: Property;
  layout?: Layout;
}

export const enquiriesApi = {
  submit: async (data: EnquiryData): Promise<EnquiryResponse> => {
    const response = await api.post("/enquiries", data);
    return response.data;
  },

  /**
   * The signed-in user's enquiries. Plot and Layout enquiries come back in one
   * list and are split by `type`, exactly as the app's My Requests tabs do.
   */
  list: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<EnquiryListItem[]> => {
    const response = await api.get("/enquiries", { params });
    return response.data?.data ?? [];
  },
};

// Layouts API Types
export interface LayoutSlot {
  id: string;
  sectionTitle: string;
  plotNumber: string;
  area: string;
  facing: string;
  price: number;
  priceUnit: string;
  priceFormatted: string;
  status: "available" | "not_available" | "sold";
  width: string | null;
  height: string | null;
  displayOrder: number;
}

export interface Layout {
  id: string;
  title: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  priceUnit: string;
  minPriceUnit: string;
  maxPriceUnit: string;
  priceRange: string;
  imageUrl: string;
  layoutImageUrl: string;
  slots: LayoutSlot[];
  slotsBySection: Record<string, LayoutSlot[]>;
  totalSlots: number;
  availableSlots: number;
  notAvailableSlots: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutsResponse {
  data: Layout[];
  meta: PropertiesMeta;
}

export const layoutsApi = {
  getLayouts: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<LayoutsResponse> => {
    const response = await api.get("/layouts", { params });
    return response.data;
  },

  getLayoutById: async (id: string): Promise<Layout> => {
    const response = await api.get(`/layouts/${id}`);
    return response.data;
  },
};

// Property Submission API Types
// Category/unit lists frozen in sync with landwalaa-user's sell_property_screen.dart
export const PROPERTY_CATEGORIES = [
  "Open Plots",
  "Residential House",
  "Apartments",
  "Villas",
  "Farmhouse",
  "Agriculture Land",
  "Farmlands",
] as const;

export const UNITS_BY_CATEGORY: Record<string, string[]> = {
  "Open Plots": ["Sq. Yards", "Sq. Meters"],
  "Residential House": ["Sq. Ft", "Sq. Yards", "Sq. Meters"],
  Apartments: ["Sq. Ft"],
  Villas: ["Sq. Yards", "Sq. Ft"],
  Farmhouse: ["Sq. Yards", "Acres", "Guntas"],
  "Agriculture Land": ["Guntas", "Acres"],
  Farmlands: ["Guntas", "Acres"],
};

export const PROPERTY_FACINGS = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

export interface PropertySubmissionData {
  title: string;
  category: string;
  listingType: string;
  size: string;
  unit: string;
  facing: string;
  price: string;
  priceNegotiable: "Yes" | "No";
  description?: string;
  location: string;
  pincode?: string;
  plotLocation?: string;
  image: File[];
  layoutImage: File[];
  documents?: File[];
}

export interface PropertySubmissionResponse {
  message: string;
  data?: unknown;
}

export const propertySubmissionApi = {
  submit: async (
    data: PropertySubmissionData,
  ): Promise<PropertySubmissionResponse> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category", data.category);
    formData.append("listingType", data.listingType);
    formData.append("size", data.size);
    formData.append("unit", data.unit);
    formData.append("facing", data.facing);
    formData.append("price", data.price);
    formData.append("priceNegotiable", data.priceNegotiable);
    formData.append("location", data.location);
    if (data.description) formData.append("description", data.description);
    if (data.pincode) formData.append("pincode", data.pincode);
    if (data.plotLocation) formData.append("plotLocation", data.plotLocation);

    if (data.image && data.image.length > 0) {
      data.image.forEach((file) => {
        formData.append("image", file);
      });
    }

    if (data.layoutImage && data.layoutImage.length > 0) {
      data.layoutImage.forEach((file) => {
        formData.append("layoutImage", file);
      });
    }

    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((file) => {
        formData.append("documents", file);
      });
    }

    const response = await api.post("/property-submissions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /** The user's own submissions, as the app's Sell Property screen lists them. */
  listMine: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PropertySubmissionListItem[]> => {
    const response = await api.get("/property-submissions", { params });
    return response.data?.data ?? [];
  },

  remove: async (id: string) => {
    const response = await api.delete(`/property-submissions/${id}`);
    return response.data;
  },
};

export interface PropertySubmissionListItem {
  id: string;
  title: string;
  size: string;
  unit?: string | null;
  category?: string | null;
  facing?: string | null;
  price?: string | null;
  priceNegotiable?: string | null;
  listingType?: string | null;
  plotLocation?: string | null;
  location?: string | null;
  pincode?: string | null;
  description?: string | null;
  imageUrls: string[];
  layoutImageUrls: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}
// Wishlist API Types
export interface WishlistData {
  type: "LAYOUT" | "PROPERTY";
  layoutId?: string;
  propertyId?: string;
}

export interface WishlistItem {
  id: string;
  type: "LAYOUT" | "PROPERTY";
  layout?: Layout;
  property?: Property;
  createdAt: string;
}

export interface WishlistResponse {
  data: WishlistItem[];
  meta: PropertiesMeta;
}

export const wishlistApi = {
  add: async (data: WishlistData) => {
    const response = await api.post("/wishlist", data);
    return response.data;
  },
  get: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<WishlistResponse> => {
    const response = await api.get("/wishlist", { params });
    return response.data;
  },
  /**
   * Remove by subject rather than by wishlist row id, so a card that only
   * knows the property/layout id can un-favourite without a lookup. Mirrors
   * the app's POST /wishlist/remove.
   */
  remove: async (data: WishlistData) => {
    const response = await api.post("/wishlist/remove", data);
    return response.data;
  },
  /** Remove by wishlist row id, for the wishlist page itself. */
  removeById: async (id: string) => {
    const response = await api.delete(`/wishlist/${id}`);
    return response.data;
  },
};

// Issue Reporting API Types
export interface IssueReportData {
  title: string;
  description: string;
  images?: File[];
}

export const issueReportsApi = {
  submit: async (data: IssueReportData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);

    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await api.post("/issue-reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getMine: async (page = 1, limit = 20): Promise<IssueReport[]> => {
    const response = await api.get("/issue-reports/mine", {
      params: { page, limit },
    });
    return response.data?.data ?? [];
  },
};

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  imageKeys: string[];
  imageUrls: string[];
  status: string;
  adminRemark: string | null;
  createdAt: string;
  updatedAt: string;
}

// Banners API Types
export interface Banner {
  id: string;
  type: "PROPERTY" | "LAYOUT";
  propertyId?: string;
  layoutId?: string;
  displayOrder: number;
  isActive: boolean;
  property?: Property;
  layout?: Layout;
}

export interface BannersResponse {
  data: Banner[];
  meta: PropertiesMeta;
}

export const bannersApi = {
  getBanners: async (): Promise<BannersResponse> => {
    const response = await api.get("/banners");
    return response.data;
  },
};

// Contact Us API Types
export interface ContactUsData {
  title: string;
  description: string;
  phone: string;
  location: string;
  email: string;
}

export const contactUsApi = {
  submit: async (data: ContactUsData) => {
    const response = await api.post("/contact", data);
    return response.data;
  },
};

// Search API Types
export interface SearchResult {
  type: "property" | "layout";
  property?: Property;
  layout?: Layout;
}

export interface SearchResponse {
  data: SearchResult[];
  meta: PropertiesMeta;
}

export const searchApi = {
  search: async (query: string): Promise<SearchResponse> => {
    const response = await api.get("/search", {
      params: { search: query },
    });
    return response.data;
  },
};

// Notifications API Types
export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: string;
  isRead: boolean;
}

export interface NotificationGroup {
  date: string;
  items: NotificationItem[];
}

export interface NotificationsResponse {
  data: {
    groups: NotificationGroup[];
  };
}

export const notificationsApi = {
  getNotifications: async (
    limit: number,
    offset: number,
  ): Promise<NotificationGroup[]> => {
    const response = await api.get<NotificationsResponse>("/notifications", {
      params: { limit, offset },
    });
    return response.data?.data?.groups ?? [];
  },
};

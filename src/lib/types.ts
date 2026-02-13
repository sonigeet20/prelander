export type CampaignStatus = "draft" | "active" | "paused" | "archived";

export interface Campaign {
  id: string;
  offerName: string;
  description: string;
  status: CampaignStatus;
  researchUrls: string[];
  brandUrls: string[];
  destinationUrl: string;
  trackingUrls: string[];
  geos: string[];
  languages: string[];
  popunderEnabled: boolean;
  silentFetchEnabled: boolean;
  autoTriggerOnInaction?: boolean;
  autoTriggerDelay?: number;
  autoRedirectDelay?: number;
  subdomain?: string;
  metadata?: {
    brandFactPack?: {
      brandName: string;
      tagline?: string;
      category: string;
      keyBenefits: string[];
      features: string[];
      targetAudience?: string;
      pricingInfo?: string;
      trustSignals: string[];
      useCases: string[];
      faqItems: Array<{ question: string; answer: string }>;
      tone: "professional" | "casual" | "premium" | "friendly";
      pros: string[];
      cons: string[];
      editorialScore?: number;
      bestFor?: string;
      testimonials?: Array<{ author: string; text: string; rating?: number }>;
      heroImageUrl?: string;
      brandColors?: {
        primary: string;
        secondary: string;
        accent: string;
        soft: string;
      };
    };
    autoTriggerOnInaction?: boolean;
    autoTriggerDelay?: number;
    autoRedirectDelay?: number;
    [key: string]: unknown;
  };
  lastResearchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lander {
  id: string;
  campaignId: string;
  title: string;
  body: string;
  cta: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: string;
  campaignId?: string;
  type: "view" | "click" | "custom";
  url?: string;
  userAgent?: string;
  ip?: string;
  consent: boolean;
  createdAt: string;
}

export interface ResearchJob {
  id: string;
  campaignId: string;
  urls: string[];
  status: "queued" | "in_progress" | "complete" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface SubdomainRequest {
  id: string;
  campaignId: string;
  offerName: string;
  desiredSubdomain: string;
  status: "pending" | "provisioned" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface ClickSession {
  id: string;
  campaignId: string;
  clusterId: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  campaigns: Campaign[];
  landers: Lander[];
  events: TrackingEvent[];
  researchJobs: ResearchJob[];
  subdomainRequests: SubdomainRequest[];
  clickSessions: ClickSession[];
}

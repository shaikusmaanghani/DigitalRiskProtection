export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SocialPlatform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'telegram';

export type AppStore = 'google_play' | 'apple_app_store' | 'apkpure' | 'aptoide' | 'telegram_repo' | 'unauthorized_cdn';

export type SocialThreatStatus =
  | 'NEW'
  | 'UNDER_INVESTIGATION'
  | 'CONFIRMED_IMPERSONATION'
  | 'TAKEDOWN_REQUESTED'
  | 'WHITELISTED'
  | 'RESOLVED';

export type MobileThreatStatus =
  | 'NEW'
  | 'INVESTIGATING'
  | 'CONFIRMED_IMPERSONATION'
  | 'TAKEDOWN_REQUESTED'
  | 'WHITELISTED'
  | 'RESOLVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  organization: string;
}

export interface OfficialHandle {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'telegram' | 'youtube';
  handle: string;
  verified: boolean;
}

export interface BrandProfile {
  id: string;
  name: string;
  industry: string;
  officialDomains: string[];
  officialHandles: OfficialHandle[];
  officialAppIds: string[];
  keywords: string[];
  riskThreshold: number;
  monitoringActive: boolean;
  lastScannedAt: string;
}

export interface SocialImpersonation {
  id: string;
  brandId: string;
  brandName: string;
  platform: SocialPlatform;
  handle: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  similarityScore: number;
  riskScore: number;
  threatLevel: ThreatLevel;
  detectionType: 'homoglyph' | 'typosquat' | 'combosquat' | 'brand_hijack' | 'support_scam' | 'executive_impersonation';
  suspiciousKeywordsFound: string[];
  bioSnippet: string;
  followerCount: number;
  followingCount: number;
  accountAgeDays: number;
  isVerified: boolean;
  status: SocialThreatStatus;
  detectedAt: string;
  evidence: {
    matchedKeywords: string[];
    homoglyphDetails?: string;
    externalLink?: string;
    takedownRecommended: boolean;
  };
}

export interface MobileAppThreat {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  packageName: string;
  store: AppStore;
  developerName: string;
  iconUrl: string;
  riskScore: number;
  threatLevel: ThreatLevel;
  detectionVector: 'trojan_banking_clone' | 'adware_imposter' | 'fake_crypto_wallet' | 'phishing_webview' | 'credential_stealer';
  abusePermissions: string[];
  downloadCountEstimate: string;
  sha256Hash: string;
  status: MobileThreatStatus;
  detectedAt: string;
  analysisSummary: string;
}

export interface TakedownRequest {
  id: string;
  threatId: string;
  threatType: 'social' | 'mobile_app' | 'domain';
  targetEntity: string;
  platform: string;
  status: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED';
  submittedBy: string;
  submittedAt: string;
  updatedAt: string;
  noticeContent: string;
  legalGrounds: 'TRADEMARK_INFRINGEMENT' | 'COPYRIGHT_DMCA' | 'PHISHING_FRAUD' | 'IDENTITY_THEFT';
  ticketReference?: string;
}

export interface ScanLog {
  id: string;
  brandId: string;
  brandName: string;
  startedAt: string;
  completedAt: string;
  sourcesScanned: number;
  newThreatsFound: number;
  status: 'COMPLETED' | 'FAILED' | 'RUNNING';
}

export interface DashboardStats {
  totalThreats: number;
  criticalThreats: number;
  highThreats: number;
  activeBrands: number;
  activeTakedowns: number;
  resolvedTakedowns: number;
  socialCount: number;
  mobileCount: number;
  platformDistribution: Record<string, number>;
  storeDistribution: Record<string, number>;
  trend: {
    labels: string[];
    values: number[];
  };
  latestScan: ScanLog | null;
}

export interface LookalikeItem {
  variant: string;
  type: string;
  similarity: number;
  description: string;
}

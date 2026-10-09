import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sentinelshield-super-secret-drp-jwt-key-2026';

app.use(express.json());

// Initialize Google GenAI client if key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

async function generateAiContentWithTimeout(prompt: string, timeoutMs = 4000): Promise<string> {
  if (!aiClient) return '';
  try {
    const aiPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    }).then(res => res.text || '');

    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve(''), timeoutMs);
    });

    return await Promise.race([aiPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Gemini request failed:', err);
    return '';
  }
}

// -------------------------------------------------------------
// IN-MEMORY / FILE PERSISTED DATABASE
// -------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'analyst' | 'viewer';
  organization: string;
  createdAt: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  industry: string;
  officialDomains: string[];
  officialHandles: {
    platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'telegram' | 'youtube';
    handle: string;
    verified: boolean;
  }[];
  officialAppIds: string[];
  keywords: string[];
  riskThreshold: number; // 0-100
  monitoringActive: boolean;
  lastScannedAt: string;
}

export interface SocialImpersonation {
  id: string;
  brandId: string;
  brandName: string;
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'telegram';
  handle: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  similarityScore: number; // 0-100
  riskScore: number; // 0-100
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectionType: 'homoglyph' | 'typosquat' | 'combosquat' | 'brand_hijack' | 'support_scam' | 'executive_impersonation';
  suspiciousKeywordsFound: string[];
  bioSnippet: string;
  followerCount: number;
  followingCount: number;
  accountAgeDays: number;
  isVerified: boolean;
  status: 'NEW' | 'UNDER_INVESTIGATION' | 'CONFIRMED_IMPERSONATION' | 'TAKEDOWN_REQUESTED' | 'WHITELISTED' | 'RESOLVED';
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
  store: 'google_play' | 'apple_app_store' | 'apkpure' | 'aptoide' | 'telegram_repo' | 'unauthorized_cdn';
  developerName: string;
  iconUrl: string;
  riskScore: number;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectionVector: 'trojan_banking_clone' | 'adware_imposter' | 'fake_crypto_wallet' | 'phishing_webview' | 'credential_stealer';
  abusePermissions: string[];
  downloadCountEstimate: string;
  sha256Hash: string;
  status: 'NEW' | 'INVESTIGATING' | 'CONFIRMED_IMPERSONATION' | 'TAKEDOWN_REQUESTED' | 'WHITELISTED' | 'RESOLVED';
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

interface DBStore {
  users: User[];
  brands: BrandProfile[];
  socialThreats: SocialImpersonation[];
  mobileThreats: MobileAppThreat[];
  takedowns: TakedownRequest[];
  scanLogs: ScanLog[];
}

let db: DBStore = {
  users: [],
  brands: [],
  socialThreats: [],
  mobileThreats: [],
  takedowns: [],
  scanLogs: [],
};

// Seed initial enterprise data
function initDefaultData() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPassword = bcrypt.hashSync('Sentinel2026!', salt);

  const defaultUsers: User[] = [
    {
      id: 'usr_admin_01',
      name: 'Elena Rostova',
      email: 'analyst@sentinelshield.io',
      passwordHash: defaultPassword,
      role: 'admin',
      organization: 'CyberSec SOC Operations',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'usr_sec_02',
      name: 'Marcus Vance',
      email: 'marcus.vance@sentinelshield.io',
      passwordHash: defaultPassword,
      role: 'analyst',
      organization: 'Brand Protection Division',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
  ];

  const defaultBrands: BrandProfile[] = [
    {
      id: 'brand_apex_01',
      name: 'ApexFin Global',
      industry: 'FinTech & Digital Banking',
      officialDomains: ['apexfin.com', 'apexfin-global.io'],
      officialHandles: [
        { platform: 'twitter', handle: '@ApexFinGlobal', verified: true },
        { platform: 'instagram', handle: '@apexfin_official', verified: true },
        { platform: 'linkedin', handle: 'company/apexfin-global', verified: true },
        { platform: 'telegram', handle: '@ApexFinAnnouncements', verified: true },
      ],
      officialAppIds: ['com.apexfin.mobile', 'com.apexfin.wealth'],
      keywords: ['ApexFin', 'Apex Wallet', 'Apex Pay', 'Apex Card', 'Apex Support'],
      riskThreshold: 65,
      monitoringActive: true,
      lastScannedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'brand_cloud_02',
      name: 'VortexAI Cloud',
      industry: 'Enterprise Cloud & AI Infra',
      officialDomains: ['vortexai.com', 'vortexcloud.io'],
      officialHandles: [
        { platform: 'twitter', handle: '@VortexAI', verified: true },
        { platform: 'linkedin', handle: 'company/vortex-ai', verified: true },
        { platform: 'facebook', handle: 'vortexaicloud', verified: true },
      ],
      officialAppIds: ['com.vortexai.console'],
      keywords: ['VortexAI', 'Vortex Cloud', 'VortexAPI', 'Vortex CLI'],
      riskThreshold: 70,
      monitoringActive: true,
      lastScannedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: 'brand_lumina_03',
      name: 'Lumina Health',
      industry: 'Digital Health & Telemedicine',
      officialDomains: ['luminahealth.org', 'lumina-care.com'],
      officialHandles: [
        { platform: 'twitter', handle: '@LuminaHealth', verified: true },
        { platform: 'instagram', handle: '@lumina.health', verified: true },
        { platform: 'facebook', handle: 'luminahealthofficial', verified: true },
      ],
      officialAppIds: ['org.luminahealth.patientapp'],
      keywords: ['Lumina Health', 'Lumina Care', 'Lumina Rx'],
      riskThreshold: 60,
      monitoringActive: true,
      lastScannedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
  ];

  const defaultSocialThreats: SocialImpersonation[] = [
    {
      id: 'soc_threat_01',
      brandId: 'brand_apex_01',
      brandName: 'ApexFin Global',
      platform: 'twitter',
      handle: '@ApexF1n_Support',
      displayName: 'ApexFin Customer Support Helpdesk',
      profileUrl: 'https://twitter.com/ApexF1n_Support',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      similarityScore: 94,
      riskScore: 96,
      threatLevel: 'CRITICAL',
      detectionType: 'homoglyph',
      suspiciousKeywordsFound: ['Support', 'Helpdesk', 'DM for recovery', 'Urgent KYC validation'],
      bioSnippet: 'Official 24/7 ApexFin Support desk. Send direct message for instant frozen transaction release & wallet verification. Link: apexfin-verify[.]net/auth',
      followerCount: 342,
      followingCount: 4210,
      accountAgeDays: 4,
      isVerified: false,
      status: 'CONFIRMED_IMPERSONATION',
      detectedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      evidence: {
        matchedKeywords: ['Support', 'Helpdesk', 'wallet verification'],
        homoglyphDetails: "Replaced 'i' with '1' in handle; appended '_Support'",
        externalLink: 'https://apexfin-verify.net/auth',
        takedownRecommended: true,
      },
    },
    {
      id: 'soc_threat_02',
      brandId: 'brand_apex_01',
      brandName: 'ApexFin Global',
      platform: 'telegram',
      handle: '@ApexFin_RewardAirdrop',
      displayName: 'ApexFin VIP Token Giveaway',
      profileUrl: 'https://t.me/ApexFin_RewardAirdrop',
      avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=120&auto=format&fit=crop&q=80',
      similarityScore: 88,
      riskScore: 92,
      threatLevel: 'CRITICAL',
      detectionType: 'combosquat',
      suspiciousKeywordsFound: ['Reward', 'Airdrop', 'Giveaway', 'Deposit required'],
      bioSnippet: 'ApexFin celebration bonus! First 500 members deposit 0.1 ETH to receive 2500 APEX tokens immediately.',
      followerCount: 12480,
      followingCount: 12,
      accountAgeDays: 9,
      isVerified: false,
      status: 'TAKEDOWN_REQUESTED',
      detectedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      evidence: {
        matchedKeywords: ['Reward', 'Airdrop', 'deposit'],
        homoglyphDetails: 'Combosquatting brand name with financial fraud keywords',
        externalLink: 'https://claim-apexfin-bonus.xyz',
        takedownRecommended: true,
      },
    },
    {
      id: 'soc_threat_03',
      brandId: 'brand_apex_01',
      brandName: 'ApexFin Global',
      platform: 'instagram',
      handle: '@apexfin_vip_invest',
      displayName: 'ApexFin Investments & Loans',
      profileUrl: 'https://instagram.com/apexfin_vip_invest',
      avatarUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
      similarityScore: 82,
      riskScore: 78,
      threatLevel: 'HIGH',
      detectionType: 'support_scam',
      suspiciousKeywordsFound: ['VIP', 'Guaranteed Returns', 'WhatsApp direct'],
      bioSnippet: 'High-yield investment portal powered by ApexFin. Guaranteed 18% weekly returns. Message WhatsApp +1-829-912-4012.',
      followerCount: 2150,
      followingCount: 1400,
      accountAgeDays: 18,
      isVerified: false,
      status: 'UNDER_INVESTIGATION',
      detectedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      evidence: {
        matchedKeywords: ['Invest', 'Guaranteed', 'WhatsApp'],
        homoglyphDetails: 'Prefix/suffix combosquatting',
        externalLink: 'https://wa.me/18299124012',
        takedownRecommended: true,
      },
    },
    {
      id: 'soc_threat_04',
      brandId: 'brand_cloud_02',
      brandName: 'VortexAI Cloud',
      platform: 'twitter',
      handle: '@VortexAl_CEO',
      displayName: 'Devon Ray (CEO VortexAI)',
      profileUrl: 'https://twitter.com/VortexAl_CEO',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      similarityScore: 91,
      riskScore: 89,
      threatLevel: 'CRITICAL',
      detectionType: 'executive_impersonation',
      suspiciousKeywordsFound: ['CEO', 'Exclusive API Credits', 'Early Token Access'],
      bioSnippet: 'Co-founder & CEO at @VortexAI. Releasing unannounced LLM models and API credit grants to early testers.',
      followerCount: 940,
      followingCount: 380,
      accountAgeDays: 6,
      isVerified: false,
      status: 'UNDER_INVESTIGATION',
      detectedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      evidence: {
        matchedKeywords: ['CEO', 'Early Access', 'API Credits'],
        homoglyphDetails: "Substituted capital 'I' with lowercase 'l' (VortexAl)",
        externalLink: 'https://vortex-devpreview.org',
        takedownRecommended: true,
      },
    },
    {
      id: 'soc_threat_05',
      brandId: 'brand_cloud_02',
      brandName: 'VortexAI Cloud',
      platform: 'linkedin',
      handle: 'company/vortex-ai-recruitment-team',
      displayName: 'VortexAI Global Recruitment Team',
      profileUrl: 'https://linkedin.com/company/vortex-ai-recruitment-team',
      avatarUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80',
      similarityScore: 79,
      riskScore: 68,
      threatLevel: 'MEDIUM',
      detectionType: 'combosquat',
      suspiciousKeywordsFound: ['Remote Job', 'Telegram Interview', 'Equip fee check'],
      bioSnippet: 'Official talent acquisition portal for VortexAI remote roles. Immediate hiring for engineers and prompt evaluators.',
      followerCount: 145,
      followingCount: 8,
      accountAgeDays: 22,
      isVerified: false,
      status: 'NEW',
      detectedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      evidence: {
        matchedKeywords: ['Recruitment', 'Remote Job', 'Interview'],
        homoglyphDetails: 'Combosquatted company page used for recruitment fee scam',
        externalLink: 'https://t.me/vortex_recruiter_agent',
        takedownRecommended: false,
      },
    },
    {
      id: 'soc_threat_06',
      brandId: 'brand_lumina_03',
      brandName: 'Lumina Health',
      platform: 'facebook',
      handle: 'luminahealth.prescriptions.us',
      displayName: 'Lumina Health Discount Prescriptions',
      profileUrl: 'https://facebook.com/luminahealth.prescriptions.us',
      avatarUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80',
      similarityScore: 84,
      riskScore: 85,
      threatLevel: 'HIGH',
      detectionType: 'brand_hijack',
      suspiciousKeywordsFound: ['No Rx Needed', 'Cheap Adderall', 'Overnight Delivery'],
      bioSnippet: 'Official Lumina Health pharmacy outlet. Get prescription medication delivered discretely without prior medical consultation.',
      followerCount: 1840,
      followingCount: 55,
      accountAgeDays: 14,
      isVerified: false,
      status: 'CONFIRMED_IMPERSONATION',
      detectedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      evidence: {
        matchedKeywords: ['Prescriptions', 'No Rx Needed', 'Delivery'],
        homoglyphDetails: 'Subdomain style naming claiming official healthcare status',
        externalLink: 'https://lumina-rx-online.shop',
        takedownRecommended: true,
      },
    },
  ];

  const defaultMobileThreats: MobileAppThreat[] = [
    {
      id: 'mob_threat_01',
      brandId: 'brand_apex_01',
      brandName: 'ApexFin Global',
      title: 'ApexFin Mobile Wallet & Pay',
      packageName: 'com.apexfin.mobile.quickpay',
      store: 'apkpure',
      developerName: 'Apex FinTech Global Devs (Unauthorized)',
      iconUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80',
      riskScore: 98,
      threatLevel: 'CRITICAL',
      detectionVector: 'trojan_banking_clone',
      abusePermissions: [
        'android.permission.RECEIVE_SMS (SMS Intercept)',
        'android.permission.READ_PHONE_STATE',
        'android.permission.SYSTEM_ALERT_WINDOW (Overlay Attack)',
        'android.permission.REQUEST_INSTALL_PACKAGES',
      ],
      downloadCountEstimate: '15,000+',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'TAKEDOWN_REQUESTED',
      detectedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      analysisSummary: 'Malicious banking trojan packaging legitimate ApexFin branding. Injects transparent overlay over authentic banking login fields to harvest 2FA OTP codes and credit card PINs.',
    },
    {
      id: 'mob_threat_02',
      brandId: 'brand_apex_01',
      brandName: 'ApexFin Global',
      title: 'Apex Crypto Vault & Staking',
      packageName: 'com.apex.cryptovault.fin',
      store: 'aptoide',
      developerName: 'Vault Tech Solutions LLC',
      iconUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=120&auto=format&fit=crop&q=80',
      riskScore: 88,
      threatLevel: 'CRITICAL',
      detectionVector: 'fake_crypto_wallet',
      abusePermissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.CAMERA (QR Scanner Exfiltration)',
      ],
      downloadCountEstimate: '3,200+',
      sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      status: 'INVESTIGATING',
      detectedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      analysisSummary: 'Rogue APK generating hardcoded seed phrases. Any funds transferred into the wallet are swept within 15 seconds to an attacker-controlled multi-sig wallet.',
    },
    {
      id: 'mob_threat_03',
      brandId: 'brand_cloud_02',
      brandName: 'VortexAI Cloud',
      title: 'VortexAI Assistant Pro & Prompt Studio',
      packageName: 'io.vortexai.promptgenerator.free',
      store: 'google_play',
      developerName: 'CloudTools Pro Studio',
      iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      riskScore: 74,
      threatLevel: 'HIGH',
      detectionVector: 'adware_imposter',
      abusePermissions: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.POST_NOTIFICATIONS',
      ],
      downloadCountEstimate: '50,000+',
      sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      status: 'NEW',
      detectedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      analysisSummary: 'Imposter app displaying copyrighted VortexAI graphics on Google Play. Charges $49.99/mo hidden subscription fee after a 2-day trial, generating hundreds of customer billing complaints.',
    },
    {
      id: 'mob_threat_04',
      brandId: 'brand_lumina_03',
      brandName: 'Lumina Health',
      title: 'Lumina Patient Care Portal',
      packageName: 'net.luminahealth.portal.apk',
      store: 'telegram_repo',
      developerName: 'Unknown (Circulating in Telegram Fraud Channels)',
      iconUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=120&auto=format&fit=crop&q=80',
      riskScore: 95,
      threatLevel: 'CRITICAL',
      detectionVector: 'credential_stealer',
      abusePermissions: [
        'android.permission.READ_CONTACTS',
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
      ],
      downloadCountEstimate: '1,500+',
      sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      status: 'CONFIRMED_IMPERSONATION',
      detectedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      analysisSummary: 'Spyware payload targeting Lumina Health patients. Exfiltrates medical insurance cards, patient SSNs, and device photos to a command-and-control server in Eastern Europe.',
    },
  ];

  const defaultTakedowns: TakedownRequest[] = [
    {
      id: 'tk_apex_01',
      threatId: 'soc_threat_01',
      threatType: 'social',
      targetEntity: '@ApexF1n_Support',
      platform: 'Twitter / X',
      status: 'IN_REVIEW',
      submittedBy: 'analyst@sentinelshield.io',
      submittedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      noticeContent: 'FORMAL NOTICE OF TRADEMARK INFRINGEMENT AND PHISHING IMPERSONATION.\nTarget: @ApexF1n_Support (Twitter/X)\nTrademark: ApexFin Global (USPTO Reg #6,419,203)\nEvidence: Phishing credential harvester operating at apexfin-verify[.]net targeting verified bank customers.',
      legalGrounds: 'TRADEMARK_INFRINGEMENT',
      ticketReference: 'X-ABUSE-2026-948102',
    },
    {
      id: 'tk_apex_02',
      threatId: 'mob_threat_01',
      threatType: 'mobile_app',
      targetEntity: 'com.apexfin.mobile.quickpay',
      platform: 'APKPure',
      status: 'SUBMITTED',
      submittedBy: 'analyst@sentinelshield.io',
      submittedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      noticeContent: 'DMCA & MALWARE REMOVAL REQUEST: Rogue banking trojan exploiting ApexFin trademarks and icons with SMS interception capabilities. Immediate purge requested under Safe Harbor provisions.',
      legalGrounds: 'PHISHING_FRAUD',
      ticketReference: 'APKP-DMCA-88310',
    },
  ];

  const defaultScanLogs: ScanLog[] = [
    {
      id: 'scan_01',
      brandId: 'brand_apex_01',
      brandName: 'ApexFin Global',
      startedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      completedAt: new Date(Date.now() - 28 * 60000).toISOString(),
      sourcesScanned: 1420,
      newThreatsFound: 2,
      status: 'COMPLETED',
    },
    {
      id: 'scan_02',
      brandId: 'brand_cloud_02',
      brandName: 'VortexAI Cloud',
      startedAt: new Date(Date.now() - 90 * 60000).toISOString(),
      completedAt: new Date(Date.now() - 88 * 60000).toISOString(),
      sourcesScanned: 980,
      newThreatsFound: 1,
      status: 'COMPLETED',
    },
  ];

  return {
    users: defaultUsers,
    brands: defaultBrands,
    socialThreats: defaultSocialThreats,
    mobileThreats: defaultMobileThreats,
    takedowns: defaultTakedowns,
    scanLogs: defaultScanLogs,
  };
}

// Load or seed DB
function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(content);
    } else {
      db = initDefaultData();
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading database, resetting to default seed:', err);
    db = initDefaultData();
  }
}

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

loadDatabase();

// -------------------------------------------------------------
// LOOK-ALIKE & RISK SCORING ALGORITHM HELPERS
// -------------------------------------------------------------
// Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Calculate similarity ratio (0 to 100)
function calculateSimilarity(brand: string, candidate: string): number {
  const cleanBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanCand = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (cleanBrand === cleanCand) return 100;
  if (cleanCand.includes(cleanBrand) || cleanBrand.includes(cleanCand)) {
    const longer = Math.max(cleanBrand.length, cleanCand.length);
    const shorter = Math.min(cleanBrand.length, cleanCand.length);
    return Math.min(96, Math.round((shorter / longer) * 100 + 20));
  }

  const dist = levenshteinDistance(cleanBrand, cleanCand);
  const maxLen = Math.max(cleanBrand.length, cleanCand.length);
  if (maxLen === 0) return 0;
  const score = Math.max(0, Math.round((1 - dist / maxLen) * 100));
  return score;
}

// Homoglyph & permutation generator
const HOMOGLYPH_MAP: Record<string, string[]> = {
  a: ['4', '@', 'а'], // cyrillic a
  b: ['8', '6'],
  c: ['ç', 'с'], // cyrillic c
  e: ['3', 'е'], // cyrillic e
  i: ['1', 'l', '!', '|', 'і'],
  l: ['1', 'i', '|'],
  o: ['0', 'о'], // cyrillic o
  p: ['р'], // cyrillic r
  s: ['5', '$'],
  t: ['7', '+'],
  u: ['v', 'µ'],
  v: ['u', 'w'],
  w: ['vv'],
};

const SUSPICIOUS_AFFIXES = [
  'support', 'help', 'helpdesk', 'official', 'service', 'care', 'recovery',
  'security', 'verify', 'claims', 'airdrop', 'rewards', 'promo', 'login',
  'portal', 'team', 'agent', 'bot', 'global', 'vip', 'desk', 'center',
];

export function generateLookalikes(brandName: string): Array<{
  variant: string;
  type: string;
  similarity: number;
  description: string;
}> {
  const clean = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const results: Array<{ variant: string; type: string; similarity: number; description: string }> = [];

  // 1. Homoglyphs
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (HOMOGLYPH_MAP[ch]) {
      for (const sub of HOMOGLYPH_MAP[ch]) {
        const variant = clean.slice(0, i) + sub + clean.slice(i + 1);
        results.push({
          variant,
          type: 'Homoglyph Attack',
          similarity: calculateSimilarity(clean, variant),
          description: `Character '${ch}' replaced with visually identical lookalike '${sub}'`,
        });
      }
    }
  }

  // 2. Typosquatting (repeated letter, dropped letter, transposition)
  for (let i = 0; i < clean.length; i++) {
    // Drop letter
    const dropped = clean.slice(0, i) + clean.slice(i + 1);
    if (dropped.length >= 3) {
      results.push({
        variant: dropped,
        type: 'Typosquatting (Omission)',
        similarity: calculateSimilarity(clean, dropped),
        description: `Omitted '${clean[i]}' from brand string`,
      });
    }
    // Double letter
    const doubled = clean.slice(0, i + 1) + clean[i] + clean.slice(i + 1);
    results.push({
      variant: doubled,
      type: 'Typosquatting (Duplication)',
      similarity: calculateSimilarity(clean, doubled),
      description: `Duplicated '${clean[i]}' character`,
    });
  }

  // 3. Combosquatting (affixes)
  const sampleAffixes = SUSPICIOUS_AFFIXES.slice(0, 8);
  for (const affix of sampleAffixes) {
    results.push({
      variant: `${clean}_${affix}`,
      type: 'Combosquatting (Suffix)',
      similarity: calculateSimilarity(clean, `${clean}_${affix}`),
      description: `Appended high-risk keyword '_${affix}'`,
    });
    results.push({
      variant: `${affix}_${clean}`,
      type: 'Combosquatting (Prefix)',
      similarity: calculateSimilarity(clean, `${affix}_${clean}`),
      description: `Prepended high-risk keyword '${affix}_'`,
    });
  }

  return results.slice(0, 24);
}

// Risk calculation logic
export function calculateRiskScore(params: {
  similarity: number;
  suspiciousKeywordsCount: number;
  hasExternalLink: boolean;
  isUnverifiedWhileClaimingOfficial: boolean;
  accountAgeDays: number;
  followerRatioSuspicious: boolean;
}): { score: number; level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' } {
  let score = 0;

  // Similarity weight: up to 35
  score += Math.round((params.similarity / 100) * 35);

  // Keywords weight: up to 20
  score += Math.min(20, params.suspiciousKeywordsCount * 7);

  // External link / Phishing vector: 15
  if (params.hasExternalLink) score += 15;

  // Verification mismatch: 15
  if (params.isUnverifiedWhileClaimingOfficial) score += 15;

  // Fresh account (< 14 days old): 10
  if (params.accountAgeDays < 14) score += 10;

  // Follower anomaly: 5
  if (params.followerRatioSuspicious) score += 5;

  score = Math.min(100, Math.max(10, score));

  let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (score >= 85) level = 'CRITICAL';
  else if (score >= 70) level = 'HIGH';
  else if (score >= 45) level = 'MEDIUM';

  return { score, level };
}

// -------------------------------------------------------------
// AUTH MIDDLEWARE
// -------------------------------------------------------------
interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organization: string;
  };
}

function authenticateToken(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SentinelShield DRP',
    version: '2.4.0',
    geminiEnabled: !!aiClient,
    timestamp: new Date().toISOString(),
  });
});

// AUTH: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, organization } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'analyst',
    organization: organization || 'CyberSecurity Ops',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDatabase();

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, organization: newUser.organization },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization: newUser.organization,
    },
  });
});

// AUTH: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, organization: user.organization },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
    },
  });
});

// AUTH: Current User (me)
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
  const user = db.users.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
    },
  });
});

// BRANDS: Get all
app.get('/api/brands', authenticateToken, (req, res) => {
  res.json({ brands: db.brands });
});

// BRANDS: Create brand
app.post('/api/brands', authenticateToken, (req, res) => {
  const { name, industry, officialDomains, officialHandles, officialAppIds, keywords, riskThreshold } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Brand name is required' });
  }

  const newBrand: BrandProfile = {
    id: `brand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    industry: industry || 'Technology',
    officialDomains: Array.isArray(officialDomains) ? officialDomains : [],
    officialHandles: Array.isArray(officialHandles) ? officialHandles : [],
    officialAppIds: Array.isArray(officialAppIds) ? officialAppIds : [],
    keywords: Array.isArray(keywords) && keywords.length > 0 ? keywords : [name],
    riskThreshold: typeof riskThreshold === 'number' ? riskThreshold : 65,
    monitoringActive: true,
    lastScannedAt: new Date().toISOString(),
  };

  db.brands.push(newBrand);
  saveDatabase();

  res.status(201).json({ brand: newBrand });
});

// BRANDS: Update brand
app.put('/api/brands/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const brandIndex = db.brands.findIndex(b => b.id === id);

  if (brandIndex === -1) {
    return res.status(404).json({ error: 'Brand profile not found' });
  }

  const current = db.brands[brandIndex];
  const updated: BrandProfile = {
    ...current,
    ...req.body,
    id: current.id, // prevent overwriting ID
  };

  db.brands[brandIndex] = updated;
  saveDatabase();

  res.json({ brand: updated });
});

// BRANDS: Delete brand
app.delete('/api/brands/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.brands = db.brands.filter(b => b.id !== id);
  // Also clean up or flag associated threats
  saveDatabase();
  res.json({ success: true, message: 'Brand profile deleted' });
});

// THREATS: Social Impersonation - List with filters & pagination
app.get('/api/threats/social', authenticateToken, (req, res) => {
  const { brandId, platform, severity, status, search } = req.query;

  let threats = [...db.socialThreats];

  if (brandId && typeof brandId === 'string') {
    threats = threats.filter(t => t.brandId === brandId);
  }

  if (platform && typeof platform === 'string' && platform !== 'all') {
    threats = threats.filter(t => t.platform === platform);
  }

  if (severity && typeof severity === 'string' && severity !== 'all') {
    threats = threats.filter(t => t.threatLevel === severity);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    threats = threats.filter(t => t.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    threats = threats.filter(
      t =>
        t.handle.toLowerCase().includes(q) ||
        t.displayName.toLowerCase().includes(q) ||
        t.brandName.toLowerCase().includes(q) ||
        t.bioSnippet.toLowerCase().includes(q)
    );
  }

  // Sort descending by risk score
  threats.sort((a, b) => b.riskScore - a.riskScore);

  res.json({ threats, total: threats.length });
});

// THREATS: Update social threat status (Investigation, Whitelist, Takedown, Resolve)
app.patch('/api/threats/social/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const threat = db.socialThreats.find(t => t.id === id);
  if (!threat) {
    return res.status(404).json({ error: 'Threat not found' });
  }

  const validStatuses = ['NEW', 'UNDER_INVESTIGATION', 'CONFIRMED_IMPERSONATION', 'TAKEDOWN_REQUESTED', 'WHITELISTED', 'RESOLVED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  threat.status = status;

  // If whitelisted, optionally add to brand's official handles exclusion
  if (status === 'WHITELISTED') {
    const brand = db.brands.find(b => b.id === threat.brandId);
    if (brand) {
      const alreadyExcluded = brand.officialHandles.some(
        h => h.handle.toLowerCase() === threat.handle.toLowerCase() && h.platform === threat.platform
      );
      if (!alreadyExcluded) {
        brand.officialHandles.push({
          platform: threat.platform as any,
          handle: threat.handle,
          verified: false,
        });
      }
    }
  }

  saveDatabase();
  res.json({ threat });
});

// THREATS: Mobile App Threats - List
app.get('/api/threats/mobile', authenticateToken, (req, res) => {
  const { brandId, store, severity, status, search } = req.query;

  let threats = [...db.mobileThreats];

  if (brandId && typeof brandId === 'string') {
    threats = threats.filter(t => t.brandId === brandId);
  }

  if (store && typeof store === 'string' && store !== 'all') {
    threats = threats.filter(t => t.store === store);
  }

  if (severity && typeof severity === 'string' && severity !== 'all') {
    threats = threats.filter(t => t.threatLevel === severity);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    threats = threats.filter(t => t.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    threats = threats.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.packageName.toLowerCase().includes(q) ||
        t.developerName.toLowerCase().includes(q) ||
        t.brandName.toLowerCase().includes(q)
    );
  }

  threats.sort((a, b) => b.riskScore - a.riskScore);
  res.json({ threats, total: threats.length });
});

// THREATS: Update mobile threat status
app.patch('/api/threats/mobile/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const threat = db.mobileThreats.find(t => t.id === id);
  if (!threat) {
    return res.status(404).json({ error: 'Mobile app threat not found' });
  }

  threat.status = status;
  saveDatabase();
  res.json({ threat });
});

// LOOKALIKE GENERATOR & SIMULATOR
app.get('/api/detection/lookalikes', authenticateToken, (req, res) => {
  const brandName = (req.query.brandName as string) || 'ApexFin';
  const lookalikes = generateLookalikes(brandName);
  res.json({ brandName, lookalikes, count: lookalikes.length });
});

// REAL-TIME FAKE PROFILE DETECTION ENGINE
app.post('/api/detection/analyze-profile', authenticateToken, async (req, res) => {
  const {
    handle,
    displayName,
    platform = 'twitter',
    bio = '',
    followerCount = 100,
    followingCount = 1500,
    accountAgeDays = 5,
    isVerified = false,
    externalLink = '',
    brandId,
    saveToDatabase = false,
  } = req.body;

  if (!handle) {
    return res.status(400).json({ error: 'Handle / username is required for analysis' });
  }

  const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
  const targetBrand = brandId ? db.brands.find(b => b.id === brandId) : db.brands[0];

  // 1. Check if handle is on the official exclusions whitelist
  let isExcluded = false;
  let matchedExcludedBrand: BrandProfile | null = null;
  for (const b of db.brands) {
    if (b.officialHandles.some(h => h.handle.toLowerCase() === cleanHandle.toLowerCase())) {
      isExcluded = true;
      matchedExcludedBrand = b;
      break;
    }
  }

  if (isExcluded && matchedExcludedBrand) {
    return res.json({
      isFake: false,
      confidence: 'VERY_HIGH',
      verdict: 'OFFICIAL_VERIFIED_ASSET',
      verdictTitle: 'Legitimate Official Brand Asset',
      riskScore: 5,
      threatLevel: 'LOW',
      matchedBrand: matchedExcludedBrand.name,
      isWhitelisted: true,
      homoglyphsDetected: [],
      suspiciousFlags: ['Account is registered in Brand Official-Account Exclusions whitelist'],
      aiForensics: `This account (${cleanHandle}) is verified as an official corporate communication channel for ${matchedExcludedBrand.name}. It is safely whitelisted in SentinelShield exclusions. No enforcement action required.`,
      recommendedAction: 'Maintain on Whitelist - Continuous Passive Monitoring',
    });
  }

  // 2. Homoglyph Detection
  const homoglyphsDetected: string[] = [];
  const handleLower = cleanHandle.toLowerCase();
  for (const [char, lookalikes] of Object.entries(HOMOGLYPH_MAP)) {
    for (const l of lookalikes) {
      if (handleLower.includes(l) && targetBrand && targetBrand.name.toLowerCase().includes(char)) {
        homoglyphsDetected.push(`Character '${l}' visually mimics authentic '${char}'`);
      }
    }
  }

  // 3. Typo/Affix detection
  const suspiciousKeywords: string[] = [];
  const lowerBio = (bio || '').toLowerCase();
  const lowerName = (displayName || '').toLowerCase();
  const lowerAll = `${handleLower} ${lowerName} ${lowerBio}`;

  const dangerWords = [
    'support', 'helpdesk', 'customer care', 'official', 'verify', 'recovery',
    'frozen', 'kyc', 'airdrop', 'giveaway', 'reward', 'dm for help', 'whatsapp',
    'urgent', 'telegram agent', 'unfreeze', 'seed phrase', 'bonus', 'claim',
  ];

  for (const word of dangerWords) {
    if (lowerAll.includes(word)) {
      suspiciousKeywords.push(word.toUpperCase());
    }
  }

  // 4. Calculate similarity against brand
  const brandName = targetBrand ? targetBrand.name : 'ApexFin Global';
  const similarity = calculateSimilarity(brandName, cleanHandle.replace('@', ''));

  // 5. Calculate composite risk score
  const isClaimingOfficial = lowerAll.includes('official') || lowerAll.includes('support') || lowerAll.includes('helpdesk');
  const followerRatioSuspicious = followingCount > followerCount * 4 && followerCount < 500;
  const hasExternalLink = !!externalLink || lowerBio.includes('.xyz') || lowerBio.includes('.net') || lowerBio.includes('t.me') || lowerBio.includes('wa.me');

  const riskResult = calculateRiskScore({
    similarity,
    suspiciousKeywordsCount: suspiciousKeywords.length,
    hasExternalLink,
    isUnverifiedWhileClaimingOfficial: isClaimingOfficial && !isVerified,
    accountAgeDays,
    followerRatioSuspicious,
  });

  const isFake = riskResult.score >= 60;
  let verdict: 'CONFIRMED_FAKE_IMPERSONATOR' | 'SUSPICIOUS_PROFILE' | 'OFFICIAL_VERIFIED_ASSET' | 'LOW_RISK_UNRELATED' = 'LOW_RISK_UNRELATED';
  let verdictTitle = 'Low Threat / Unrelated Profile';

  if (riskResult.score >= 80) {
    verdict = 'CONFIRMED_FAKE_IMPERSONATOR';
    verdictTitle = 'CRITICAL: High-Confidence Fake Profile & Impersonator';
  } else if (riskResult.score >= 55) {
    verdict = 'SUSPICIOUS_PROFILE';
    verdictTitle = 'WARNING: Suspicious Brand Lookalike';
  }

  // 6. Gemini AI Deep Reasoning
  let aiForensics = '';
  const prompt = `You are SentinelShield's Senior Threat Intelligence Analyst.
Conduct a forensic investigation on this suspected fake social profile:
- Handle: ${cleanHandle} (${platform})
- Display Name: ${displayName || cleanHandle}
- Targeted Brand: ${brandName}
- Bio: "${bio}"
- Follower Count: ${followerCount} | Following: ${followingCount} | Account Age: ${accountAgeDays} days
- Verified Status: ${isVerified ? 'VERIFIED' : 'UNVERIFIED'}
- External Link: ${externalLink || 'None provided'}
- Homoglyphs: ${JSON.stringify(homoglyphsDetected)}
- Suspicious Keywords: ${JSON.stringify(suspiciousKeywords)}
- Calculated Risk Score: ${riskResult.score}/100

Explain in 3 structured points:
1. Deception Vector & Attacker Intent (Why is this account fake? What scam or harvesting is it executing?)
2. Damage to Brand & Consumers
3. Recommended Action (e.g. Immediate DMCA/Trademark Takedown, Cease & Desist, or Watchlist).`;

  aiForensics = await generateAiContentWithTimeout(prompt, 3500);

  if (!aiForensics) {
    aiForensics = `### 1. Deception Vector & Attacker Intent
The account "${cleanHandle}" matches ${similarity}% of the "${brandName}" trademark while operating without verified badge credentials. The combination of an unverified fresh account (${accountAgeDays} days old) with high-priority support hooks (${suspiciousKeywords.slice(0, 3).join(', ')}) strongly indicates a fraudulent support imposter harvesting customer credentials.

### 2. Consumer Impact
Unsuspecting users seeking customer assistance are redirected to third-party endpoints or malicious direct messages, posing direct financial theft and credential exfiltration risks.

### 3. Immediate Action
Initiate automated platform abuse report and trademark takedown notice under Safe Harbor provisions.`;
  }

  // Optionally save to active threats database
  let savedThreatId: string | null = null;
  if (saveToDatabase && targetBrand) {
    const newThreat: SocialImpersonation = {
      id: `soc_scan_${Date.now()}`,
      brandId: targetBrand.id,
      brandName: targetBrand.name,
      platform: platform as any,
      handle: cleanHandle,
      displayName: displayName || cleanHandle,
      profileUrl: `https://${platform}.com/${cleanHandle.replace('@', '')}`,
      avatarUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&auto=format&fit=crop&q=80',
      similarityScore: similarity,
      riskScore: riskResult.score,
      threatLevel: riskResult.level,
      detectionType: homoglyphsDetected.length > 0 ? 'homoglyph' : 'support_scam',
      suspiciousKeywordsFound: suspiciousKeywords,
      bioSnippet: bio || 'No bio provided',
      followerCount: Number(followerCount) || 0,
      followingCount: Number(followingCount) || 0,
      accountAgeDays: Number(accountAgeDays) || 1,
      isVerified: !!isVerified,
      status: 'CONFIRMED_IMPERSONATION',
      detectedAt: new Date().toISOString(),
      evidence: {
        matchedKeywords: suspiciousKeywords,
        homoglyphDetails: homoglyphsDetected.join('; '),
        externalLink: externalLink || undefined,
        takedownRecommended: true,
      },
    };
    db.socialThreats.unshift(newThreat);
    saveDatabase();
    savedThreatId = newThreat.id;
  }

  res.json({
    isFake,
    confidence: riskResult.score > 80 ? 'VERY_HIGH' : riskResult.score > 60 ? 'HIGH' : 'MEDIUM',
    verdict,
    verdictTitle,
    riskScore: riskResult.score,
    threatLevel: riskResult.level,
    similarityScore: similarity,
    matchedBrand: brandName,
    isWhitelisted: false,
    homoglyphsDetected,
    suspiciousFlags: suspiciousKeywords,
    aiForensics,
    recommendedAction: isFake ? 'File Immediate Trademark & Phishing Takedown' : 'Log Profile for Continuous Monitoring',
    savedThreatId,
  });
});

// REAL-TIME FAKE APP DETECTION ENGINE
app.post('/api/detection/analyze-app', authenticateToken, async (req, res) => {
  const {
    title,
    packageName,
    store = 'google_play',
    developerName = 'Unknown Developer',
    permissions = [],
    brandId,
    downloadCount = '1,000+',
    sha256Hash,
    saveToDatabase = false,
  } = req.body;

  if (!title && !packageName) {
    return res.status(400).json({ error: 'App title or package name required for inspection' });
  }

  const targetBrand = brandId ? db.brands.find(b => b.id === brandId) : db.brands[0];
  const brandName = targetBrand ? targetBrand.name : 'ApexFin Global';

  // 1. Check if package name is on the official authorized app IDs list
  let isOfficial = false;
  let matchedOfficialBrand: BrandProfile | null = null;
  for (const b of db.brands) {
    if (b.officialAppIds.some(appId => appId.toLowerCase() === (packageName || '').toLowerCase())) {
      isOfficial = true;
      matchedOfficialBrand = b;
      break;
    }
  }

  if (isOfficial && matchedOfficialBrand) {
    return res.json({
      isFake: false,
      confidence: 'VERY_HIGH',
      verdict: 'OFFICIAL_AUTHORIZED_APP',
      verdictTitle: 'Legitimate Authorized Brand Application',
      riskScore: 0,
      threatLevel: 'LOW',
      matchedBrand: matchedOfficialBrand.name,
      isOfficialApp: true,
      abusePermissions: [],
      detectionVector: 'official_authorized_binary',
      aiForensics: `The package "${packageName}" matches the verified official application registry for ${matchedOfficialBrand.name}. This is an authentic corporate mobile release.`,
      recommendedAction: 'Verified Safe - Keep in Authorized Baseline',
    });
  }

  // 2. Permission Risk Scoring
  const permissionArray: string[] = Array.isArray(permissions) ? permissions : [];
  let permRisk = 0;
  const flaggedAbusePerms: string[] = [];

  const highRiskPermKeywords = [
    { key: 'RECEIVE_SMS', label: 'SMS Intercept (OTP Bypass)', score: 30 },
    { key: 'READ_SMS', label: 'Read SMS Messages', score: 25 },
    { key: 'SYSTEM_ALERT_WINDOW', label: 'Overlay Attack (Phishing Screen)', score: 25 },
    { key: 'BIND_ACCESSIBILITY_SERVICE', label: 'Accessibility Hijacking (Keylogger)', score: 30 },
    { key: 'REQUEST_INSTALL_PACKAGES', label: 'Silent Trojan Dropper', score: 20 },
    { key: 'READ_CONTACTS', label: 'Contact Exfiltration', score: 15 },
    { key: 'RECORD_AUDIO', label: 'Audio Surveillance', score: 20 },
    { key: 'CAMERA', label: 'Camera Spyware', score: 15 },
  ];

  for (const p of permissionArray) {
    for (const rule of highRiskPermKeywords) {
      if (p.toUpperCase().includes(rule.key)) {
        permRisk += rule.score;
        flaggedAbusePerms.push(`${rule.label} [${p}]`);
      }
    }
  }

  // 3. Name & Package Permutation Similarity
  const cleanBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPkg = (packageName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTitle = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const hasBrandInPkg = cleanPkg.includes(cleanBrand);
  const hasBrandInTitle = cleanTitle.includes(cleanBrand);

  let nameRisk = 0;
  if (hasBrandInPkg || hasBrandInTitle) nameRisk += 30;
  if (store !== 'google_play' && store !== 'apple_app_store') nameRisk += 20; // 3rd party repos

  // Composite App Risk (0-100)
  const totalScore = Math.min(100, Math.max(15, permRisk + nameRisk));
  let threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (totalScore >= 80) threatLevel = 'CRITICAL';
  else if (totalScore >= 60) threatLevel = 'HIGH';
  else if (totalScore >= 40) threatLevel = 'MEDIUM';

  // Determine attack vector
  let detectionVector = 'trojan_banking_clone';
  if (flaggedAbusePerms.some(p => p.includes('SMS') || p.includes('Overlay'))) {
    detectionVector = 'trojan_banking_clone';
  } else if (title.toLowerCase().includes('vault') || title.toLowerCase().includes('wallet')) {
    detectionVector = 'fake_crypto_wallet';
  } else if (flaggedAbusePerms.some(p => p.includes('Silent Trojan Dropper'))) {
    detectionVector = 'credential_stealer';
  } else {
    detectionVector = 'adware_imposter';
  }

  // 4. Gemini AI Forensic Evaluation
  let aiForensics = '';
  const prompt = `You are SentinelShield's Senior Mobile Malware Reverse Engineer.
Analyze this suspected fake/trojanized mobile app:
- App Title: ${title}
- Package Name: ${packageName}
- Repository / Store: ${store}
- Developer: ${developerName}
- Target Brand: ${brandName}
- Abuse Permissions: ${JSON.stringify(flaggedAbusePerms)}
- Download Estimate: ${downloadCount}
- Composite Risk: ${totalScore}/100 (${threatLevel})

Provide a structured forensic report:
1. Malicious Capabilities & Trojan Classification (e.g. Banking overlay, SMS OTP theft, fake wallet sweeper)
2. Risk to Consumers & Brand Reputation
3. Recommended Takedown Steps under Google Play Developer Content Policy or DMCA Safe Harbor.`;

  aiForensics = await generateAiContentWithTimeout(prompt, 3500);

  if (!aiForensics) {
    aiForensics = `### 1. Malware Classification & Attack Vector
The APK "${packageName}" is identified as a **${detectionVector.replace('_', ' ').toUpperCase()}**. It impersonates authentic "${brandName}" branding while requesting dangerous system permissions (${flaggedAbusePerms.slice(0, 2).join(', ')}). This signature matches active credential-stealing campaigns engineered to bypass 2-factor authentication.

### 2. Threat Impact
Users downloading this unauthorized package risk total compromise of login credentials, SMS-intercepted bank OTPs, and unauthorized financial transactions.

### 3. Immediate Enforcement
Submit an expedited Safe Harbor DMCA / Trademark Infringement notice directly to the repository abuse desk with SHA-256 hash preservation.`;
  }

  // Save if requested
  let savedThreatId: string | null = null;
  if (saveToDatabase && targetBrand) {
    const newMobileThreat: MobileAppThreat = {
      id: `mob_scan_${Date.now()}`,
      brandId: targetBrand.id,
      brandName: targetBrand.name,
      title: title || 'Rogue APK Clone',
      packageName: packageName || `com.rogue.${cleanBrand}.apk`,
      store: store as any,
      developerName,
      iconUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80',
      riskScore: totalScore,
      threatLevel,
      detectionVector: detectionVector as any,
      abusePermissions: flaggedAbusePerms.length > 0 ? flaggedAbusePerms : ['android.permission.INTERNET'],
      downloadCountEstimate: downloadCount,
      sha256Hash: sha256Hash || '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
      status: 'CONFIRMED_IMPERSONATION',
      detectedAt: new Date().toISOString(),
      analysisSummary: aiForensics.slice(0, 200) + '...',
    };
    db.mobileThreats.unshift(newMobileThreat);
    saveDatabase();
    savedThreatId = newMobileThreat.id;
  }

  res.json({
    isFake: totalScore >= 50,
    confidence: totalScore > 80 ? 'VERY_HIGH' : 'HIGH',
    verdict: totalScore >= 75 ? 'CONFIRMED_ROGUE_MALWARE' : totalScore >= 50 ? 'SUSPICIOUS_CLONE' : 'BENIGN_APP',
    verdictTitle: totalScore >= 75 ? 'CRITICAL: Confirmed Malicious Trojan Clone' : 'Warning: Unauthorized Brand Lookalike APK',
    riskScore: totalScore,
    threatLevel,
    detectionVector,
    matchedBrand: brandName,
    isOfficialApp: false,
    abusePermissions: flaggedAbusePerms,
    aiForensics,
    recommendedAction: 'Dispatch Platform Malware Notice & Request Binary Takedown',
    savedThreatId,
  });
});

// SCANNER: Trigger live scan
app.post('/api/scan/run', authenticateToken, (req, res) => {
  const { brandId } = req.body;

  const brand = db.brands.find(b => b.id === brandId) || db.brands[0];
  if (!brand) {
    return res.status(404).json({ error: 'No brand configured to scan' });
  }

  // Simulate scanning across social platforms & repositories
  // Generate realistic detection if not already present
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const platforms: Array<'twitter' | 'instagram' | 'telegram' | 'linkedin'> = ['twitter', 'instagram', 'telegram', 'linkedin'];
  const pickedPlatform = platforms[Math.floor(Math.random() * platforms.length)];
  const cleanBrand = brand.name.replace(/\s+/g, '');

  const newThreatHandle = `@${cleanBrand}_Support${randomSuffix}`;

  // Check if handle is in official brand exclusions!
  const isExcluded = brand.officialHandles.some(
    h => h.handle.toLowerCase() === newThreatHandle.toLowerCase()
  );

  let newThreatsCount = 0;
  if (!isExcluded) {
    const similarity = calculateSimilarity(cleanBrand, `${cleanBrand}_Support${randomSuffix}`);
    const risk = calculateRiskScore({
      similarity,
      suspiciousKeywordsCount: 3,
      hasExternalLink: true,
      isUnverifiedWhileClaimingOfficial: true,
      accountAgeDays: 2,
      followerRatioSuspicious: true,
    });

    const newThreat: SocialImpersonation = {
      id: `soc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      brandId: brand.id,
      brandName: brand.name,
      platform: pickedPlatform,
      handle: newThreatHandle,
      displayName: `${brand.name} Online Support Portal`,
      profileUrl: `https://${pickedPlatform}.com/${newThreatHandle.replace('@', '')}`,
      avatarUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&auto=format&fit=crop&q=80',
      similarityScore: similarity,
      riskScore: risk.score,
      threatLevel: risk.level,
      detectionType: 'support_scam',
      suspiciousKeywordsFound: ['Support Portal', 'Quick Verification', 'Urgent KYC'],
      bioSnippet: `Official support representative for ${brand.name}. Click our portal link to resolve account freezes and security hold: https://${brand.name.toLowerCase()}-resolve-desk.xyz`,
      followerCount: Math.floor(Math.random() * 120) + 10,
      followingCount: Math.floor(Math.random() * 2500) + 800,
      accountAgeDays: Math.floor(Math.random() * 7) + 1,
      isVerified: false,
      status: 'NEW',
      detectedAt: new Date().toISOString(),
      evidence: {
        matchedKeywords: ['Support Portal', 'Account Freezes', 'Security Hold'],
        homoglyphDetails: 'Combosquatting brand name with customer support keywords',
        externalLink: `https://${brand.name.toLowerCase()}-resolve-desk.xyz`,
        takedownRecommended: true,
      },
    };

    db.socialThreats.unshift(newThreat);
    newThreatsCount++;
  }

  const log: ScanLog = {
    id: `scan_${Date.now()}`,
    brandId: brand.id,
    brandName: brand.name,
    startedAt: new Date(Date.now() - 45000).toISOString(),
    completedAt: new Date().toISOString(),
    sourcesScanned: Math.floor(Math.random() * 1500) + 1200,
    newThreatsFound: newThreatsCount,
    status: 'COMPLETED',
  };

  brand.lastScannedAt = new Date().toISOString();
  db.scanLogs.unshift(log);
  saveDatabase();

  res.json({
    success: true,
    scanLog: log,
    message: `Scan finished across 8 social networks, 4 app stores, and 1,200+ domain registries. ${newThreatsCount} new threat detected.`,
  });
});

// TAKEDOWNS: List all
app.get('/api/takedowns', authenticateToken, (req, res) => {
  res.json({ takedowns: db.takedowns });
});

// TAKEDOWNS: Create takedown notice
app.post('/api/takedowns', authenticateToken, (req: AuthRequest, res) => {
  const { threatId, threatType, targetEntity, platform, legalGrounds, customNotice } = req.body;

  if (!threatId || !targetEntity) {
    return res.status(400).json({ error: 'Threat ID and target entity required' });
  }

  // Generate legal boilerplate if not custom
  const noticeContent =
    customNotice ||
    `CEASE AND DESIST / TAKEDOWN DEMAND UNDER DIGITAL RISK PROTECTION REGULATIONS
To: ${platform} Trust & Safety / Abuse Enforcement Team
Subject: Immediate Suspension Request - Trademark Infringement & Malicious Impersonation

Target Identity: ${targetEntity}
Violation Class: ${legalGrounds || 'TRADEMARK_INFRINGEMENT'}
Date of Notice: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

SentinelShield Digital Risk Operations, acting on behalf of authorized trademark holders, hereby formally requests the immediate removal and account termination of ${targetEntity}.

EVIDENCE SUMMARY:
1. Unauthorized commercial use of registered trademarks and copyrighted brand collateral.
2. Deployment of deceptive homoglyph/combosquat patterns intentionally engineered to deceive consumers into surrendering sensitive credentials or funds.
3. Violation of platform Terms of Service regarding deceptive impersonation and phishing.

Pursuant to applicable safe-harbor standards (DMCA 17 U.S.C. § 512 & International Equivalents), failure to act upon this verified notice upon delivery exposes your service to secondary contributory liability.

Submitted by: ${req.user?.email || 'SOC Team'}
Organization: ${req.user?.organization || 'SentinelShield DRP'}`;

  const newTakedown: TakedownRequest = {
    id: `tk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    threatId,
    threatType: threatType || 'social',
    targetEntity,
    platform: platform || 'Social Platform',
    status: 'SUBMITTED',
    submittedBy: req.user?.email || 'SOC Analyst',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    noticeContent,
    legalGrounds: legalGrounds || 'TRADEMARK_INFRINGEMENT',
    ticketReference: `SS-TKD-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  db.takedowns.unshift(newTakedown);

  // Update threat status
  if (threatType === 'social') {
    const t = db.socialThreats.find(item => item.id === threatId);
    if (t) t.status = 'TAKEDOWN_REQUESTED';
  } else if (threatType === 'mobile_app') {
    const m = db.mobileThreats.find(item => item.id === threatId);
    if (m) m.status = 'TAKEDOWN_REQUESTED';
  }

  saveDatabase();
  res.status(201).json({ takedown: newTakedown });
});

// TAKEDOWNS: Update status
app.patch('/api/takedowns/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const takedown = db.takedowns.find(t => t.id === id);
  if (!takedown) {
    return res.status(404).json({ error: 'Takedown record not found' });
  }

  takedown.status = status;
  takedown.updatedAt = new Date().toISOString();
  saveDatabase();

  res.json({ takedown });
});

// METRICS & DASHBOARD STATS
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const totalSocial = db.socialThreats.length;
  const totalMobile = db.mobileThreats.length;
  const totalThreats = totalSocial + totalMobile;

  const criticalCount =
    db.socialThreats.filter(t => t.threatLevel === 'CRITICAL').length +
    db.mobileThreats.filter(t => t.threatLevel === 'CRITICAL').length;

  const highCount =
    db.socialThreats.filter(t => t.threatLevel === 'HIGH').length +
    db.mobileThreats.filter(t => t.threatLevel === 'HIGH').length;

  const pendingTakedowns = db.takedowns.filter(t => t.status === 'SUBMITTED' || t.status === 'IN_REVIEW').length;
  const resolvedTakedowns = db.takedowns.filter(t => t.status === 'ACCEPTED').length;

  // Platform breakdown
  const platformsCount: Record<string, number> = {};
  db.socialThreats.forEach(t => {
    platformsCount[t.platform] = (platformsCount[t.platform] || 0) + 1;
  });

  // App store breakdown
  const storesCount: Record<string, number> = {};
  db.mobileThreats.forEach(t => {
    storesCount[t.store] = (storesCount[t.store] || 0) + 1;
  });

  // Threat trend by day (last 7 days simulated)
  const now = Date.now();
  const dayLabels: string[] = [];
  const trendCounts: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    trendCounts.push(Math.floor(2 + (6 - i) * 1.5 + (i % 2 === 0 ? 3 : 1)));
  }

  res.json({
    totalThreats,
    criticalThreats: criticalCount,
    highThreats: highCount,
    activeBrands: db.brands.length,
    activeTakedowns: pendingTakedowns,
    resolvedTakedowns,
    socialCount: totalSocial,
    mobileCount: totalMobile,
    platformDistribution: platformsCount,
    storeDistribution: storesCount,
    trend: {
      labels: dayLabels,
      values: trendCounts,
    },
    latestScan: db.scanLogs[0] || null,
  });
});

// -------------------------------------------------------------
// AI THREAT COPILOT & ANALYST (GEMINI API INTEGRATION)
// -------------------------------------------------------------
app.post('/api/ai/analyze-threat', authenticateToken, async (req, res) => {
  const { threatType, threatData } = req.body;

  if (!threatData) {
    return res.status(400).json({ error: 'Threat data is required for analysis' });
  }

  const prompt = `You are SentinelShield's Senior Threat Intelligence Analyst and Digital Risk Protection (DRP) AI.
Analyze the following digital asset impersonation threat:

Asset Type: ${threatType || 'Social Media Impersonation'}
Target Brand: ${threatData.brandName}
Candidate Identifier: ${threatData.handle || threatData.packageName || threatData.title}
Display Name / Title: ${threatData.displayName || threatData.title}
Platform / Store: ${threatData.platform || threatData.store}
Risk Score: ${threatData.riskScore}/100 (${threatData.threatLevel})
Detection Type: ${threatData.detectionType || threatData.detectionVector}
Extracted Content / Bio / Permissions: ${threatData.bioSnippet || JSON.stringify(threatData.abusePermissions || [])}
Suspicious Indicators: ${JSON.stringify(threatData.suspiciousKeywordsFound || threatData.evidence || {})}

Provide a structured, executive cybersecurity assessment:
1. **Threat Profile & Modus Operandi**: How is the attacker deceiving users (homoglyphs, social engineering, malicious overlays)?
2. **Business & Consumer Impact**: Potential financial loss, credential harvesting, brand trust erosion, customer complaints.
3. **Recommended Enforcement Action**: Specific takedown mechanism, legal framework (e.g. DMCA, ICANN UDRP, Google Play Developer Policy violation), and urgency rating.
4. **Customized Platform Abuse Report / Cease & Desist Paragraph**: A concise, copy-ready legal enforcement statement ready to submit to the platform's Trust & Safety desk.

Keep the response authoritative, concise, and structured with clear headings.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({
        analysis: response.text,
        generatedBy: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Gemini threat analysis failed:', err);
      // Fallback to expert heuristic report
    }
  }

  // Expert Heuristic Fallback if AI key is unavailable
  const fallbackAnalysis = `### 1. Threat Profile & Modus Operandi
The detected entity **"${threatData.handle || threatData.packageName}"** displays deliberate characteristics of **${threatData.detectionType || threatData.detectionVector || 'Brand Impersonation'}**. The threat actor utilizes deceptive visual permutations alongside high-urgency customer service hooks ("Support", "KYC Verification", "Frozen Account") to intercept organic customer traffic seeking official support.

### 2. Business & Consumer Impact
* **Direct Financial Fraud**: High probability of credential harvesting (passwords, 2FA OTP codes, or crypto seed phrases).
* **Reputational Degradation**: Victimized consumers are likely to attribute lost assets or privacy breaches to ${threatData.brandName}.
* **Operational Overhead**: Influx of customer complaints and chargeback claims to legitimate support channels.

### 3. Recommended Enforcement Actions
* **Immediate Platform Takedown**: Issue a high-priority abuse complaint under platform impersonation and anti-phishing guidelines.
* **Domain Infrastructure Neutralization**: Request registrar suspension and Cloudflare/hosting takedown for all linked phishing URLs.
* **Proactive Customer Alert**: Broadcast verification warnings across official handles: reminding users that official representatives never request passwords or transfers via DM.

### 4. Platform Abuse Demand Notice
"This account is engaged in unauthorized brand impersonation of ${threatData.brandName} and fraudulent customer phishing in direct violation of platform Terms of Service. It incorporates deceptive trademark assets to harvest confidential user credentials. SentinelShield requests immediate suspension and account preservation for law enforcement review."`;

  res.json({
    analysis: fallbackAnalysis,
    generatedBy: 'heuristic-engine',
  });
});

// AI COPILOT CHAT
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  const { message, contextThreat } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const systemPrompt = `You are SentinelShield Threat Copilot, an enterprise-grade Digital Risk Protection (DRP) and Brand Defense AI assistant.
You specialize in:
- Identifying look-alike domain/handle vectors (homoglyphs, typosquatting, combosquatting, bitsquatting).
- Advising on social media impersonator takedowns across Meta (Instagram/Facebook), X (Twitter), LinkedIn, TikTok, and Telegram.
- Evaluating malicious mobile apps, rogue APKs, overlay malware, and permission hijacking on Google Play and third-party stores.
- Generating formal DMCA notices, trademark infringement filings, and Cease & Desist letters.
- Formulating brand defense playbooks, official account exclusion lists, and proactive monitoring strategies.

Tone: Crisp, professional, highly analytical, and cyber-defense oriented.
Provide actionable bullet points, code or templates where helpful.`;

  const userContent = contextThreat
    ? `[Active Threat Context: Brand "${contextThreat.brandName}", Target "${contextThreat.handle || contextThreat.packageName}", Risk Score: ${contextThreat.riskScore}/100, Type: ${contextThreat.detectionType || contextThreat.detectionVector}]\n\nUser Question: ${message}`
    : message;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userContent,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      return res.json({
        reply: response.text,
        model: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Gemini chat failed:', err);
    }
  }

  // Rule-based cyber analyst fallback response
  let heuristicReply = `As your SentinelShield Cyber Analyst, here is our tactical guidance on **"${message.slice(0, 50)}..."**:

1. **Immediate Risk Mitigation**:
   - Verify if this identifier is on your Brand Official Exclusions list before initiating takedowns.
   - For high-confidence impersonators (>70 risk score), export the digital evidence bundle (URL, screenshots, timestamped WHOIS/account headers).
2. **Enforcement Channel**:
   - If on **X (Twitter)**: File under the Brand Impersonation & Safety policy via their partner portal or API abuse endpoint.
   - If on **Telegram**: Report directly to @notoscam with cryptographic or transaction evidence.
   - If an **Android APK**: Submit an urgent package hash dispute to Google Play Protect and host registrar abuse desks.
3. **Recommended Next Step**:
   - Click the **"Request Takedown"** button on the threat row to auto-generate a customized Cease & Desist notice.`;

  if (message.toLowerCase().includes('homoglyph')) {
    heuristicReply = `**Homoglyph Attacks in Digital Risk Protection**:
Homoglyph (or IDN homograph) attacks substitute Latin letters with visually identical characters from Cyrillic, Greek, or Unicode sets (e.g., Cyrillic 'а' U+0430 for Latin 'a' U+0061, or digit '0' for 'o').
* **Attacker Strategy**: Victims cannot discern the difference visually on mobile screens and trust URLs like \`аpexfin.com\` or handles like \`@ApexF1n\`.
* **SentinelShield Defense**: Our detection engine normalizes Unicode strings, checks Levenshtein phonetic distance, and flags any account utilizing non-standard glyphs while claiming brand affiliation.`;
  } else if (message.toLowerCase().includes('takedown') || message.toLowerCase().includes('dmca')) {
    heuristicReply = `**Enterprise Takedown Procedure**:
1. **Identify Legal Basis**: Trademark Infringement (Lanham Act / Madrid Protocol) vs. DMCA Copyright (for stolen logos/graphics) vs. Phishing/Fraud (Computer Fraud and Abuse Act).
2. **Include Mandatory Elements**:
   - Registered Trademark Registration Number (e.g. USPTO or EUIPO).
   - Specific infringing URL, handle, or package name.
   - Proof of active deception (fraudulent support link, fake giveaway).
   - Statement of good faith belief under penalty of perjury.
3. SentinelShield lets you generate this with 1 click using the "Generate Notice" action in our Takedowns tab.`;
  }

  res.json({
    reply: heuristicReply,
    model: 'sentinel-heuristics-engine',
  });
});

// SYSTEM / ARCHITECTURE: MongoDB Schemas & Setup Endpoint
app.get('/api/system/schema', (req, res) => {
  res.json({
    database: 'MongoDB (Mongoose ODM)',
    databaseName: 'sentinelshield_drp',
    collections: [
      {
        name: 'users',
        description: 'SOC analysts and administrative accounts with bcrypt-hashed credentials and JWT role scopes.',
        indexes: [{ email: 1, unique: true }],
      },
      {
        name: 'brand_profiles',
        description: 'Protected corporate brand assets, monitored keywords, official domains, official handle exclusions, and sensitivity thresholds.',
        indexes: [{ name: 1 }],
      },
      {
        name: 'social_threats',
        description: 'Impersonation findings across X, Instagram, LinkedIn, Facebook, TikTok, Telegram with risk scoring, homoglyph data, and status lifecycle.',
        indexes: [{ brandId: 1 }, { riskScore: -1 }, { handle: 1 }],
      },
      {
        name: 'mobile_app_threats',
        description: 'Suspicious and trojanized APKs across Google Play, APKPure, Aptoide, and Telegram with package names, hashes, and abuse permissions.',
        indexes: [{ brandId: 1 }, { packageName: 1 }],
      },
      {
        name: 'takedown_requests',
        description: 'Legal enforcement tickets with DMCA/trademark notice bodies, platform references, and resolution timelines.',
        indexes: [{ threatId: 1 }, { status: 1 }],
      },
    ],
  });
});

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC ASSETS
// -------------------------------------------------------------
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SentinelShield Full-Stack DRP Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();

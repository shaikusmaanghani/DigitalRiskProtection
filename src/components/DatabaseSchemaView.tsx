import React, { useState } from 'react';
import {
  Database,
  Code,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Layers,
  Server,
  Key,
} from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schemas' | 'setup' | 'seed'>('schemas');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const mongooseCode = `// ========================================================
// SentinelShield - MongoDB Mongoose Schemas & Models
// Connection: mongoose.connect(process.env.MONGODB_URI)
// ========================================================
import mongoose, { Schema, Document } from 'mongoose';

// 1. User Schema (SOC Analysts & Admins)
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'analyst' | 'viewer';
  organization: string;
  createdAt: Date;
}

export const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'analyst', 'viewer'], default: 'analyst' },
  organization: { type: String, default: 'Security Operations Center' },
  createdAt: { type: Date, default: Date.now },
});

// 2. Brand Profile Schema (Protected Trademarks & Exclusions)
export interface IBrandProfile extends Document {
  name: string;
  industry: string;
  officialDomains: string[];
  officialHandles: Array<{
    platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'telegram' | 'youtube';
    handle: string;
    verified: boolean;
  }>;
  officialAppIds: string[];
  keywords: string[];
  riskThreshold: number;
  monitoringActive: boolean;
  lastScannedAt: Date;
}

export const BrandProfileSchema = new Schema<IBrandProfile>({
  name: { type: String, required: true, index: true },
  industry: { type: String, required: true },
  officialDomains: [{ type: String }],
  officialHandles: [
    {
      platform: { type: String, required: true },
      handle: { type: String, required: true },
      verified: { type: Boolean, default: true },
    },
  ],
  officialAppIds: [{ type: String }],
  keywords: [{ type: String }],
  riskThreshold: { type: Number, default: 65, min: 0, max: 100 },
  monitoringActive: { type: Boolean, default: true },
  lastScannedAt: { type: Date, default: Date.now },
});

// 3. Social Media Impersonation Threat Schema
export interface ISocialThreat extends Document {
  brandId: mongoose.Types.ObjectId;
  brandName: string;
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'telegram';
  handle: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  similarityScore: number;
  riskScore: number;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectionType: 'homoglyph' | 'typosquat' | 'combosquat' | 'brand_hijack' | 'support_scam' | 'executive_impersonation';
  suspiciousKeywordsFound: string[];
  bioSnippet: string;
  followerCount: number;
  followingCount: number;
  accountAgeDays: number;
  isVerified: boolean;
  status: 'NEW' | 'UNDER_INVESTIGATION' | 'CONFIRMED_IMPERSONATION' | 'TAKEDOWN_REQUESTED' | 'WHITELISTED' | 'RESOLVED';
  detectedAt: Date;
  evidence: {
    matchedKeywords: string[];
    homoglyphDetails?: string;
    externalLink?: string;
    takedownRecommended: boolean;
  };
}

export const SocialThreatSchema = new Schema<ISocialThreat>({
  brandId: { type: Schema.Types.ObjectId, ref: 'BrandProfile', required: true, index: true },
  brandName: { type: String, required: true },
  platform: { type: String, required: true, index: true },
  handle: { type: String, required: true, index: true },
  displayName: { type: String, required: true },
  profileUrl: { type: String, required: true },
  avatarUrl: { type: String },
  similarityScore: { type: Number, required: true },
  riskScore: { type: Number, required: true, index: true },
  threatLevel: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], index: true },
  detectionType: { type: String, required: true },
  suspiciousKeywordsFound: [{ type: String }],
  bioSnippet: { type: String },
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  accountAgeDays: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['NEW', 'UNDER_INVESTIGATION', 'CONFIRMED_IMPERSONATION', 'TAKEDOWN_REQUESTED', 'WHITELISTED', 'RESOLVED'],
    default: 'NEW',
    index: true,
  },
  detectedAt: { type: Date, default: Date.now },
  evidence: {
    matchedKeywords: [{ type: String }],
    homoglyphDetails: { type: String },
    externalLink: { type: String },
    takedownRecommended: { type: Boolean, default: true },
  },
});

// 4. Mobile App Threat Schema (Rogue APKs & App Store Clones)
export interface IMobileThreat extends Document {
  brandId: mongoose.Types.ObjectId;
  brandName: string;
  title: string;
  packageName: string;
  store: 'google_play' | 'apple_app_store' | 'apkpure' | 'aptoide' | 'telegram_repo' | 'unauthorized_cdn';
  developerName: string;
  iconUrl: string;
  riskScore: number;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectionVector: string;
  abusePermissions: string[];
  downloadCountEstimate: string;
  sha256Hash: string;
  status: string;
  detectedAt: Date;
  analysisSummary: string;
}

export const MobileThreatSchema = new Schema<IMobileThreat>({
  brandId: { type: Schema.Types.ObjectId, ref: 'BrandProfile', required: true, index: true },
  brandName: { type: String, required: true },
  title: { type: String, required: true },
  packageName: { type: String, required: true, index: true },
  store: { type: String, required: true },
  developerName: { type: String, required: true },
  iconUrl: { type: String },
  riskScore: { type: Number, required: true },
  threatLevel: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
  detectionVector: { type: String, required: true },
  abusePermissions: [{ type: String }],
  downloadCountEstimate: { type: String },
  sha256Hash: { type: String, required: true, index: true },
  status: { type: String, default: 'NEW' },
  detectedAt: { type: Date, default: Date.now },
  analysisSummary: { type: String },
});

// 5. Takedown Request Schema (Cease & Desist Notices)
export interface ITakedownRequest extends Document {
  threatId: string;
  threatType: 'social' | 'mobile_app' | 'domain';
  targetEntity: string;
  platform: string;
  status: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED';
  submittedBy: string;
  submittedAt: Date;
  updatedAt: Date;
  noticeContent: string;
  legalGrounds: string;
  ticketReference?: string;
}

export const TakedownRequestSchema = new Schema<ITakedownRequest>({
  threatId: { type: String, required: true },
  threatType: { type: String, required: true },
  targetEntity: { type: String, required: true },
  platform: { type: String, required: true },
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'REJECTED'], default: 'SUBMITTED' },
  submittedBy: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  noticeContent: { type: String, required: true },
  legalGrounds: { type: String, required: true },
  ticketReference: { type: String },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
export const BrandProfileModel = mongoose.model<IBrandProfile>('BrandProfile', BrandProfileSchema);
export const SocialThreatModel = mongoose.model<ISocialThreat>('SocialThreat', SocialThreatSchema);
export const MobileThreatModel = mongoose.model<IMobileThreat>('MobileThreat', MobileThreatSchema);
export const TakedownModel = mongoose.model<ITakedownRequest>('TakedownRequest', TakedownRequestSchema);
`;

  const setupInstructions = `# ========================================================
# SentinelShield Deployment & MongoDB Setup Guide
# ========================================================

1. Environment Configuration (.env):
   PORT=3000
   JWT_SECRET="your-256-bit-secure-jwt-secret-key"
   GEMINI_API_KEY="AIzaSy..."          # Injected automatically in AI Studio
   MONGODB_URI="mongodb+srv://admin:pass@cluster.mongodb.net/sentinelshield?retryWrites=true&w=majority"

2. Running MongoDB locally with Docker:
   docker run -d --name sentinel-mongo -p 27017:27017 -e MONGO_INITDB_DATABASE=sentinelshield mongo:7.0

3. Connecting Mongoose inside Express:
   import mongoose from 'mongoose';
   
   if (process.env.MONGODB_URI) {
     await mongoose.connect(process.env.MONGODB_URI);
     console.log('Connected to MongoDB Cluster');
   }

4. Running the Dev Server:
   npm run dev      # Starts tsx server.ts with Vite middleware on port 3000

5. Building for Production:
   npm run build    # Compiles React SPA to /dist
   npm run start    # Starts production Node Express server
`;

  const seedScript = `// seed-mongodb.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinelshield';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB. Seeding initial brand defense profiles...');

  const passwordHash = bcrypt.hashSync('Sentinel2026!', 10);

  // Seed SOC Analyst
  await mongoose.connection.collection('users').insertOne({
    name: 'Elena Rostova',
    email: 'analyst@sentinelshield.io',
    passwordHash,
    role: 'admin',
    organization: 'CyberSec SOC Operations',
    createdAt: new Date(),
  });

  // Seed Brand Profile with Official Exclusions
  await mongoose.connection.collection('brand_profiles').insertOne({
    name: 'ApexFin Global',
    industry: 'FinTech & Digital Banking',
    officialDomains: ['apexfin.com', 'apexfin-global.io'],
    officialHandles: [
      { platform: 'twitter', handle: '@ApexFinGlobal', verified: true },
      { platform: 'instagram', handle: '@apexfin_official', verified: true },
      { platform: 'telegram', handle: '@ApexFinAnnouncements', verified: true },
    ],
    officialAppIds: ['com.apexfin.mobile', 'com.apexfin.wealth'],
    keywords: ['ApexFin', 'Apex Wallet', 'Apex Pay'],
    riskThreshold: 65,
    monitoringActive: true,
    lastScannedAt: new Date(),
  });

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <span>MongoDB Architecture, Schemas & Production Deployment</span>
        </h1>
        <p className="text-xs text-slate-400">
          Production Mongoose ODM schemas, collection indexes, environment setup, and database seeding scripts for SentinelShield.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('schemas')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'schemas'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Mongoose Schemas (5 Models)</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'setup'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Setup Instructions & .env</span>
        </button>

        <button
          onClick={() => setActiveTab('seed')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'seed'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>MongoDB Seed Script</span>
        </button>
      </div>

      {/* Code Display Area */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 relative">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>
              {activeTab === 'schemas'
                ? 'src/db/models.ts'
                : activeTab === 'setup'
                ? 'DEPLOYMENT.md'
                : 'scripts/seed-mongodb.js'}
            </span>
          </div>

          <button
            onClick={() =>
              copyToClipboard(
                activeTab,
                activeTab === 'schemas'
                  ? mongooseCode
                  : activeTab === 'setup'
                  ? setupInstructions
                  : seedScript
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            {copiedCode === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-2 leading-relaxed max-h-[600px] overflow-y-auto">
          {activeTab === 'schemas' && mongooseCode}
          {activeTab === 'setup' && setupInstructions}
          {activeTab === 'seed' && seedScript}
        </pre>
      </div>
    </div>
  );
};

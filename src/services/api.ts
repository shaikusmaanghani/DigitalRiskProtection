import {
  BrandProfile,
  DashboardStats,
  LookalikeItem,
  MobileAppThreat,
  SocialImpersonation,
  TakedownRequest,
  User,
} from '../types';

const TOKEN_KEY = 'sentinelshield_jwt_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async register(name: string, email: string, password: string, organization?: string): Promise<{ token: string; user: User }> {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, organization }),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return apiRequest<{ user: User }>('/api/auth/me');
  },

  logout() {
    removeAuthToken();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>('/api/dashboard/stats');
  },

  // Brands
  async getBrands(): Promise<{ brands: BrandProfile[] }> {
    return apiRequest<{ brands: BrandProfile[] }>('/api/brands');
  },

  async createBrand(brand: Partial<BrandProfile>): Promise<{ brand: BrandProfile }> {
    return apiRequest<{ brand: BrandProfile }>('/api/brands', {
      method: 'POST',
      body: JSON.stringify(brand),
    });
  },

  async updateBrand(id: string, brand: Partial<BrandProfile>): Promise<{ brand: BrandProfile }> {
    return apiRequest<{ brand: BrandProfile }>(`/api/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brand),
    });
  },

  async deleteBrand(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/api/brands/${id}`, {
      method: 'DELETE',
    });
  },

  // Social Threats
  async getSocialThreats(params: {
    brandId?: string;
    platform?: string;
    severity?: string;
    status?: string;
    search?: string;
  } = {}): Promise<{ threats: SocialImpersonation[]; total: number }> {
    const query = new URLSearchParams();
    if (params.brandId) query.set('brandId', params.brandId);
    if (params.platform) query.set('platform', params.platform);
    if (params.severity) query.set('severity', params.severity);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    return apiRequest<{ threats: SocialImpersonation[]; total: number }>(`/api/threats/social?${query.toString()}`);
  },

  async updateSocialThreatStatus(id: string, status: string): Promise<{ threat: SocialImpersonation }> {
    return apiRequest<{ threat: SocialImpersonation }>(`/api/threats/social/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Mobile App Threats
  async getMobileThreats(params: {
    brandId?: string;
    store?: string;
    severity?: string;
    status?: string;
    search?: string;
  } = {}): Promise<{ threats: MobileAppThreat[]; total: number }> {
    const query = new URLSearchParams();
    if (params.brandId) query.set('brandId', params.brandId);
    if (params.store) query.set('store', params.store);
    if (params.severity) query.set('severity', params.severity);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    return apiRequest<{ threats: MobileAppThreat[]; total: number }>(`/api/threats/mobile?${query.toString()}`);
  },

  async updateMobileThreatStatus(id: string, status: string): Promise<{ threat: MobileAppThreat }> {
    return apiRequest<{ threat: MobileAppThreat }>(`/api/threats/mobile/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Scanning
  async runScan(brandId?: string): Promise<{ success: boolean; scanLog: any; message: string }> {
    return apiRequest<{ success: boolean; scanLog: any; message: string }>('/api/scan/run', {
      method: 'POST',
      body: JSON.stringify({ brandId }),
    });
  },

  // Lookalike Hunter
  async getLookalikes(brandName: string): Promise<{ brandName: string; lookalikes: LookalikeItem[]; count: number }> {
    return apiRequest<{ brandName: string; lookalikes: LookalikeItem[]; count: number }>(
      `/api/detection/lookalikes?brandName=${encodeURIComponent(brandName)}`
    );
  },

  // Takedowns
  async getTakedowns(): Promise<{ takedowns: TakedownRequest[] }> {
    return apiRequest<{ takedowns: TakedownRequest[] }>('/api/takedowns');
  },

  async createTakedown(data: {
    threatId: string;
    threatType: 'social' | 'mobile_app' | 'domain';
    targetEntity: string;
    platform: string;
    legalGrounds?: string;
    customNotice?: string;
  }): Promise<{ takedown: TakedownRequest }> {
    return apiRequest<{ takedown: TakedownRequest }>('/api/takedowns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTakedownStatus(id: string, status: string): Promise<{ takedown: TakedownRequest }> {
    return apiRequest<{ takedown: TakedownRequest }>(`/api/takedowns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // AI Copilot & Analysis
  async analyzeThreatWithAi(threatType: string, threatData: any): Promise<{ analysis: string; generatedBy: string }> {
    return apiRequest<{ analysis: string; generatedBy: string }>('/api/ai/analyze-threat', {
      method: 'POST',
      body: JSON.stringify({ threatType, threatData }),
    });
  },

  async askAiCopilot(message: string, contextThreat?: any): Promise<{ reply: string; model: string }> {
    return apiRequest<{ reply: string; model: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, contextThreat }),
    });
  },

  // Real-Time Detection
  async analyzeFakeProfile(data: {
    handle: string;
    displayName?: string;
    platform?: string;
    bio?: string;
    followerCount?: number;
    followingCount?: number;
    accountAgeDays?: number;
    isVerified?: boolean;
    externalLink?: string;
    brandId?: string;
    saveToDatabase?: boolean;
  }): Promise<{
    isFake: boolean;
    confidence: string;
    verdict: string;
    verdictTitle: string;
    riskScore: number;
    threatLevel: string;
    similarityScore: number;
    matchedBrand: string;
    isWhitelisted: boolean;
    homoglyphsDetected: string[];
    suspiciousFlags: string[];
    aiForensics: string;
    recommendedAction: string;
    savedThreatId?: string | null;
  }> {
    return apiRequest<any>('/api/detection/analyze-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async analyzeFakeApp(data: {
    title: string;
    packageName: string;
    store?: string;
    developerName?: string;
    permissions?: string[];
    brandId?: string;
    downloadCount?: string;
    sha256Hash?: string;
    saveToDatabase?: boolean;
  }): Promise<{
    isFake: boolean;
    confidence: string;
    verdict: string;
    verdictTitle: string;
    riskScore: number;
    threatLevel: string;
    detectionVector: string;
    matchedBrand: string;
    isOfficialApp: boolean;
    abusePermissions: string[];
    aiForensics: string;
    recommendedAction: string;
    savedThreatId?: string | null;
  }> {
    return apiRequest<any>('/api/detection/analyze-app', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // System Schema
  async getSystemSchema(): Promise<any> {
    return apiRequest<any>('/api/system/schema');
  },
};

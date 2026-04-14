export type PlatformStatus = "connected" | "disconnected" | "error";

export interface Platform {
  id: string;
  name: string;
  status: PlatformStatus;
  lastSync: string;
  icon?: string;
}

export interface AppSubmission {
  id: string;
  platformId: string;
  version: string;
  architecture: "32-bit" | "64-bit" | "Universal";
  status: "pending" | "uploading" | "reviewing" | "approved" | "rejected";
  submittedAt: string;
  notes?: string;
}

export interface PlatformConfig {
  id: string;
  apiKey?: string;
  apiSecret?: string;
  appId?: string;
  accessToken?: string;
  botAppId?: string;
  botAppSecret?: string;
}

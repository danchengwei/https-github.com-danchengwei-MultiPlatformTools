import { JSONFilePreset } from 'lowdb/node';

// Define the database schema
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface PlatformConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
  botAppId?: string;
  botAppSecret?: string;
}

export interface Platform {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  config?: PlatformConfig;
}

export interface AppPackage {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  architecture: '32-bit' | '64-bit' | 'Universal';
  uploadDate: string;
  status: 'ready' | 'archived';
}

export interface AuditRecord {
  id: string;
  platformId: string;
  packageId: string;
  version: string;
  status: 'reviewing' | 'approved' | 'rejected';
  submitDate: string;
  notes?: string;
  feedback?: string;
}

export interface DbSchema {
  users: User[];
  platforms: Platform[];
  packages: AppPackage[];
  audits: AuditRecord[];
}

// Default data
const defaultData: DbSchema = {
  users: [
    { id: '1', email: 'chengweidan9@gmail.com', name: 'chengweidan9' }
  ],
  platforms: [
    { id: "huawei", name: "华为 (AppGallery Connect)", status: "disconnected", lastSync: "-" },
    { id: "xiaomi", name: "小米应用商店", status: "disconnected", lastSync: "-" },
    { id: "oppo", name: "OPPO (ColorOS)", status: "disconnected", lastSync: "-" },
    { id: "vivo", name: "VIVO", status: "disconnected", lastSync: "-" },
    { id: "tencent", name: "应用宝 (腾讯)", status: "disconnected", lastSync: "-" },
    { id: "ali", name: "阿里 (豌豆荚/PP助手)", status: "disconnected", lastSync: "-" },
  ],
  packages: [],
  audits: []
};

// Initialize the database
export const getDb = async () => {
  const db = await JSONFilePreset<DbSchema>('db.json', defaultData);
  return db;
};

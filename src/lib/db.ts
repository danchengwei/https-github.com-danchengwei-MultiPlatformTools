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
}

export interface BotConfig {
  appId: string;
  appSecret: string;
  enabled: boolean;
}

export interface Platform {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  config?: PlatformConfig;
  portalUrl?: string;
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
  botConfig: BotConfig;
}

// Default data
const defaultData: DbSchema = {
  users: [
    { id: '1', email: 'chengweidan9@gmail.com', name: 'chengweidan9' }
  ],
  platforms: [
    { id: "huawei", name: "华为 (AppGallery Connect)", status: "disconnected", lastSync: "-", portalUrl: "https://developer.huawei.com/consumer/cn/service/josp/agc/index.html" },
    { id: "honor", name: "荣耀 (Honor Search)", status: "disconnected", lastSync: "-", portalUrl: "https://developer.honor.com/cn" },
    { id: "xiaomi", name: "小米应用商店", status: "disconnected", lastSync: "-", portalUrl: "https://dev.mi.com/console/" },
    { id: "oppo", name: "OPPO (ColorOS)", status: "disconnected", lastSync: "-", portalUrl: "https://open.oppomobile.com/" },
    { id: "vivo", name: "VIVO", status: "disconnected", lastSync: "-", portalUrl: "https://developer.vivo.com.cn/" },
    { id: "tencent", name: "应用宝 (腾讯)", status: "disconnected", lastSync: "-", portalUrl: "https://open.tencent.com/" },
    { id: "ali", name: "阿里 (豌豆荚/PP助手)", status: "disconnected", lastSync: "-", portalUrl: "https://open.uc.cn/" },
  ],
  packages: [],
  audits: [],
  botConfig: {
    appId: "",
    appSecret: "",
    enabled: false
  }
};

// Initialize the database
export const getDb = async () => {
  const db = await JSONFilePreset<DbSchema>('db.json', defaultData);
  return db;
};

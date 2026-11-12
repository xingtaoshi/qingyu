/**
 * Security & QKD Data Types for Qingyu Tactical Security Station
 */

export type QberStatus = 'normal' | 'warning' | 'critical';

export interface QkdMetrics {
  qber: number; // Quantum Bit Error Rate in percent (e.g. 1.2)
  status: QberStatus;
  keyPoolGbit: number; // e.g. 997.47
  throughputKbps: number; // e.g. 12.4
  poolCapacityPercent: number; // e.g. 91.3
  photonCountApd1: number; // counts per second
  photonCountApd2: number;
  darkCountRate: number; // cps
  basisReconciliation: number; // percent
  fiberAttenuationDbKm: number; // dB/km
}

export interface PeerNode {
  id: string;
  name: string;
  ip: string;
  role: string;
  status: 'online' | 'probing' | 'offline';
  qkdStatus: 'locked' | 'negotiating' | 'standby';
  distanceKm: number;
  azimuthDeg: number;
  rssi: number; // dBm
  lastSeen: string;
  isCurrent: boolean;
}

export type MessageType = 'text' | 'file' | 'audio' | 'signal';

export interface ChatMessage {
  id: string;
  sender: 'operator' | 'peer' | 'system';
  senderName: string;
  timestamp: string;
  type: MessageType;
  content: string; // Text content or description
  fileName?: string;
  fileSize?: string;
  audioDuration?: string;
  audioBlobUrl?: string;
  sm3Hash?: string;
  sm4Cipher?: string;
  isEncrypted: boolean;
  cipherSuite?: 'SM2-Enveloped' | 'SM4-GCM' | 'Plaintext';
  burnAfterSec?: number;
  remainingBurnSec?: number;
  deliveryStatus: 'delivered' | 'pending' | 'failed';
  receiptVerified: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  operator: string;
  terminalId: string;
  actionType: 'QKD_KEY_EXCHANGE' | 'SM2_SESSION_INIT' | 'FILE_DEPOSIT' | 'VOICE_CALL' | 'POLICY_CHANGE' | 'TERMINAL_LOCK';
  description: string;
  sm3Hash: string;
  result: 'SUCCESS' | 'WARNING' | 'REJECTED';
  ipAddress: string;
}

export interface VoiceRecord {
  id: string;
  timestamp: string;
  operator: string;
  targetTerminal: string;
  duration: string;
  bitrate: string;
  sm4Checksum: string;
  audioUrl?: string;
  sizeKb: number;
}

export interface MediaRecord {
  id: string;
  fileName: string;
  fileSize: string;
  uploader: string;
  timestamp: string;
  sm3Signature: string;
  fileType: string;
  classification: '机密' | '秘密' | '内部商用';
}

export interface SecurityPolicy {
  antiBruteForce: boolean;
  maxFailedAttempts: number;
  idleLockMinutes: number; // 5, 15, 30, 0 (never)
  sandboxAutoDestroy: boolean;
  forcedReceipt: boolean;
  qberThresholdWarning: number; // default 10%
  qberThresholdFuse: number; // default 30%
}

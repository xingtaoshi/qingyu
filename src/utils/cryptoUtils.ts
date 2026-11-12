/**
 * Cryptographic & Security Utility Functions
 * Implements pure logic for QBER thresholds, SM3/SM4 fingerprinting and formatting.
 */

import { QberStatus } from '../types/security';

/**
 * Determine QBER security state according to thresholds
 * Baseline: <= 10% Normal, 10% - 30% Warning, >= 30% Critical Fuse
 */
export function evaluateQber(
  qber: number,
  warningThreshold = 10,
  fuseThreshold = 30
): QberStatus {
  if (qber >= fuseThreshold) {
    return 'critical';
  }
  if (qber >= warningThreshold) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Format a 64-character SM3 hash to compact representation (e.g., c2bf...595c)
 */
export function formatCompactHash(hash: string, leadingChars = 4, trailingChars = 4): string {
  if (!hash || hash.length <= leadingChars + trailingChars) {
    return hash || '';
  }
  return `${hash.slice(0, leadingChars)}...${hash.slice(-trailingChars)}`;
}

/**
 * Generate a pseudo-deterministic SM3/SM4 digest from string input
 */
export function generateMockSm3Digest(input: string, salt = 'QINGYU_SM3_2026'): string {
  let hash1 = 0x5a827999;
  let hash2 = 0x6ed9eba1;
  let hash3 = 0x8f1bbcdc;
  let hash4 = 0xca62c1d6;

  const combined = input + salt;
  for (let i = 0; i < combined.length; i++) {
    const code = combined.charCodeAt(i);
    hash1 = (hash1 ^ ((code << 5) + code)) >>> 0;
    hash2 = (hash2 + ((code << 7) ^ hash1)) >>> 0;
    hash3 = (hash3 ^ ((hash2 >> 3) + code)) >>> 0;
    hash4 = (hash4 + ((hash1 << 4) ^ hash3)) >>> 0;
  }

  const hex1 = hash1.toString(16).padStart(8, '0');
  const hex2 = hash2.toString(16).padStart(8, '0');
  const hex3 = hash3.toString(16).padStart(8, '0');
  const hex4 = hash4.toString(16).padStart(8, '0');

  // Double and reverse to produce full 64-char hex digest typical of SM3 (256-bit)
  const fullHex = (hex1 + hex2 + hex3 + hex4 + hex4.split('').reverse().join('') + hex3 + hex2.split('').reverse().join('') + hex1).slice(0, 64);
  return fullHex;
}

/**
 * Format timestamp in standard tactical ISO format: HH:mm:ss
 */
export function formatTimeOnly(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Validate password against tactical security rule: at least 6 characters
 */
export function validateSecurityPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.trim().length === 0) {
    return { valid: false, message: '请输入国密终端授权口令' };
  }
  if (password.length < 6) {
    return { valid: false, message: '口令长度不得少于 6 位字符' };
  }
  return { valid: true };
}

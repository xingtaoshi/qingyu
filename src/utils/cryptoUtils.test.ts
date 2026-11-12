import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateQber,
  formatCompactHash,
  generateMockSm3Digest,
  validateSecurityPassword,
} from './cryptoUtils';

test('evaluateQber correctly categorizes normal, warning, and critical fuse states', () => {
  assert.equal(evaluateQber(1.2), 'normal');
  assert.equal(evaluateQber(9.9), 'normal');
  assert.equal(evaluateQber(10.0), 'warning');
  assert.equal(evaluateQber(15.0), 'warning');
  assert.equal(evaluateQber(29.9), 'warning');
  assert.equal(evaluateQber(30.0), 'critical');
  assert.equal(evaluateQber(35.0), 'critical');
  assert.equal(evaluateQber(50.0), 'critical');
});

test('formatCompactHash truncates full hashes nicely', () => {
  const full = 'c2bf7595c52c79a4bf4a0248ad85f67a2113f9909a341e86db703191a27e595c';
  const compact = formatCompactHash(full, 4, 4);
  assert.equal(compact, 'c2bf...595c');

  const compact6 = formatCompactHash(full, 6, 6);
  assert.equal(compact6, 'c2bf75...7e595c');

  assert.equal(formatCompactHash('short'), 'short');
  assert.equal(formatCompactHash(''), '');
});

test('generateMockSm3Digest produces a 64-character hex hash', () => {
  const digest1 = generateMockSm3Digest('几猫国产3A大作_V1.html');
  assert.equal(digest1.length, 64);
  assert.match(digest1, /^[0-9a-f]{64}$/);

  const digest2 = generateMockSm3Digest('几猫国产3A大作_V1.html');
  assert.equal(digest1, digest2, 'digest should be deterministic for same input');
});

test('validateSecurityPassword enforces presence and minimum length of 6', () => {
  assert.equal(validateSecurityPassword('').valid, false);
  assert.equal(validateSecurityPassword('12345').valid, false);
  assert.equal(validateSecurityPassword('123456').valid, true);
  assert.equal(validateSecurityPassword('Qingyu#2026').valid, true);
});

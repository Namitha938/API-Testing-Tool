const crypto = require('crypto');

// Derive a consistent 32-byte encryption key for AES-256-GCM
const rawKey = process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.JWT_SECRET || 'apitester_2fa_secure_encryption_key_default';
const encryptionKey = crypto.scryptSync(rawKey, 'salt_apitester_2fa_kdf_v1', 32);

/**
 * Encrypt plain text using AES-256-GCM.
 * Output format: ivHex:authTagHex:encryptedDataHex
 */
function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt cipher text encrypted with AES-256-GCM.
 * Handles fallback if data was stored unencrypted.
 */
function decrypt(cipherText) {
  if (!cipherText) return '';
  if (typeof cipherText !== 'string' || !cipherText.includes(':')) {
    // Stored as unencrypted plaintext
    return cipherText;
  }
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    return cipherText;
  }
  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // In case decryption fails or key changed, return empty to prevent crash
    console.error('Decryption failed for secret:', err.message);
    return '';
  }
}

/**
 * Generate N formatted alphanumeric backup recovery codes (e.g. "ABCD-1234")
 */
function generateRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    codes.push(formatted);
  }
  return codes;
}

/**
 * Normalize and SHA-256 hash a backup recovery code for storage or verification
 */
function normalizeRecoveryCode(code) {
  return (code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function hashRecoveryCode(code) {
  const normalized = normalizeRecoveryCode(code);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

module.exports = {
  encrypt,
  decrypt,
  generateRecoveryCodes,
  normalizeRecoveryCode,
  hashRecoveryCode,
};


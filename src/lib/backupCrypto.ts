import crypto from "crypto";
import { BackupSnapshot } from "./backupTypes";

export interface EncryptedBackupEnvelope {
  version: "2.0";
  algorithm: "aes-256-gcm";
  keyDerivation: "pbkdf2-sha512";
  iterations: number;
  salt: string; // hex
  iv: string; // hex (12 bytes for GCM)
  authTag: string; // hex (16 bytes)
  ciphertext: string; // base64
  checksumSha256: string; // hex
  createdAt: string;
  metadata: {
    snapshotId: string;
    roomCount?: number;
    bookingCount?: number;
    destinationCount?: number;
  };
}

const DEFAULT_SECRET = process.env.BACKUP_ENCRYPTION_KEY || "vvotel-master-enterprise-backup-key-2026";
const ITERATIONS = 100000;

function deriveKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(secret, salt, ITERATIONS, 32, "sha512");
}

/**
 * Encrypt a backup snapshot using AES-256-GCM with PBKDF2-SHA512 key derivation
 */
export function encryptBackupSnapshot(
  snapshot: BackupSnapshot,
  secret = DEFAULT_SECRET
): EncryptedBackupEnvelope {
  const plaintext = JSON.stringify(snapshot);
  const checksumSha256 = crypto.createHash("sha256").update(plaintext).digest("hex");

  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for AES-GCM
  const key = deriveKey(secret, salt);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(plaintext, "utf-8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return {
    version: "2.0",
    algorithm: "aes-256-gcm",
    keyDerivation: "pbkdf2-sha512",
    iterations: ITERATIONS,
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: encrypted,
    checksumSha256,
    createdAt: new Date().toISOString(),
    metadata: {
      snapshotId: snapshot.id,
      roomCount: snapshot.stats?.roomCount,
      bookingCount: snapshot.stats?.bookingCount,
      destinationCount: snapshot.stats?.destinationCount,
    },
  };
}

/**
 * Decrypt an AES-256-GCM encrypted backup envelope with integrity verification
 */
export function decryptBackupSnapshot(
  envelope: EncryptedBackupEnvelope,
  secret = DEFAULT_SECRET
): BackupSnapshot {
  if (envelope.algorithm !== "aes-256-gcm") {
    throw new Error(`UNSUPPORTED_ENCRYPTION_ALGORITHM: ${envelope.algorithm}`);
  }

  const salt = Buffer.from(envelope.salt, "hex");
  const iv = Buffer.from(envelope.iv, "hex");
  const authTag = Buffer.from(envelope.authTag, "hex");
  const key = deriveKey(secret, salt);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(envelope.ciphertext, "base64", "utf-8");
  decrypted += decipher.final("utf-8");

  // Verify SHA-256 checksum
  const actualChecksum = crypto.createHash("sha256").update(decrypted).digest("hex");
  if (actualChecksum !== envelope.checksumSha256) {
    throw new Error("BACKUP_INTEGRITY_MISMATCH: SHA-256 checksum does not match decrypted payload.");
  }

  return JSON.parse(decrypted);
}

/**
 * Verify envelope format and metadata without full decryption
 */
export function verifyBackupEnvelopeIntegrity(envelope: EncryptedBackupEnvelope): boolean {
  if (!envelope || envelope.version !== "2.0" || envelope.algorithm !== "aes-256-gcm") return false;
  if (!envelope.salt || envelope.salt.length !== 32) return false;
  if (!envelope.iv || envelope.iv.length !== 24) return false;
  if (!envelope.authTag || envelope.authTag.length !== 32) return false;
  if (!envelope.ciphertext || typeof envelope.ciphertext !== "string") return false;
  if (!envelope.checksumSha256 || envelope.checksumSha256.length !== 64) return false;
  return true;
}

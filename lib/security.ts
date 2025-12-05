/**
 * Security Module - Encryption, Hashing, and Security Features
 */

import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import crypto from 'crypto';

interface FailedAttempt {
  attempts: number;
  lastAttempt: number;
}

export class SecurityManager {
  private failedAttempts: Map<string, FailedAttempt> = new Map();
  private readonly lockoutDuration = 300; // 5 minutes
  private readonly maxAttempts = 5;

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate encryption key from password using PBKDF2
   */
  generateEncryptionKey(password: string, salt?: Buffer): { key: string; salt: Buffer } {
    const saltBuffer = salt || crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, saltBuffer, 100000, 32, 'sha256');
    return {
      key: key.toString('base64'),
      salt: saltBuffer,
    };
  }

  /**
   * Encrypt data using AES-256
   */
  encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  /**
   * Decrypt data using AES-256
   */
  decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Generate backup recovery codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Check if user is rate-limited
   */
  checkRateLimit(username: string): { allowed: boolean; message: string } {
    const attempt = this.failedAttempts.get(username);
    if (!attempt) {
      return { allowed: true, message: 'OK' };
    }

    const timeSinceLastAttempt = Date.now() / 1000 - attempt.lastAttempt;

    if (timeSinceLastAttempt > this.lockoutDuration) {
      this.failedAttempts.delete(username);
      return { allowed: true, message: 'OK' };
    }

    if (attempt.attempts >= this.maxAttempts) {
      const remainingTime = Math.ceil(this.lockoutDuration - timeSinceLastAttempt);
      return {
        allowed: false,
        message: `Account locked. Try again in ${remainingTime} seconds`,
      };
    }

    return { allowed: true, message: 'OK' };
  }

  /**
   * Record failed login attempt
   */
  recordFailedAttempt(username: string): void {
    const attempt = this.failedAttempts.get(username);
    if (!attempt) {
      this.failedAttempts.set(username, {
        attempts: 1,
        lastAttempt: Date.now() / 1000,
      });
    } else {
      attempt.attempts++;
      attempt.lastAttempt = Date.now() / 1000;
    }
  }

  /**
   * Reset failed attempts
   */
  resetFailedAttempts(username: string): void {
    this.failedAttempts.delete(username);
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' };
    }

    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one digit' };
    }

    return { isValid: true, message: 'Password is strong' };
  }
}


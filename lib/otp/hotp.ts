/**
 * HOTP (HMAC-based One-Time Password) Implementation
 * Complies with RFC 4226 standard
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class HOTPGenerator {
  private secret: string;
  private counter: number;

  constructor(secret?: string, initialCounter: number = 0) {
    this.secret = secret || speakeasy.generateSecret({ length: 20 }).base32;
    this.counter = initialCounter;
  }

  /**
   * Generate HOTP code for current counter (without incrementing)
   */
  generateOTP(): string {
    return speakeasy.hotp({
      secret: this.secret,
      encoding: 'base32',
      counter: this.counter,
    });
  }

  /**
   * Get current HOTP code without incrementing counter
   */
  getCurrentOTP(): string {
    return this.generateOTP();
  }

  /**
   * Generate next OTP and increment counter
   */
  generateNextOTP(): string {
    this.counter++;
    return this.generateOTP();
  }

  /**
   * @deprecated Use getCurrentOTP() or generateNextOTP() instead
   */
  generateAndIncrement(): string {
    return this.generateNextOTP();
  }

  /**
   * Verify HOTP code with look-ahead window (increments counter on success)
   */
  verifyOTP(token: string, lookAheadWindow: number = 3): boolean {
    for (let i = 0; i <= lookAheadWindow; i++) {
      const isValid = speakeasy.hotp.verify({
        secret: this.secret,
        encoding: 'base32',
        token,
        counter: this.counter + i,
      });

      if (isValid) {
        // Sync counter to the successful verification point
        this.counter = this.counter + i + 1;
        return true;
      }
    }
    return false;
  }

  /**
   * Verify HOTP code WITHOUT incrementing counter (for multiple verifications of same code)
   */
  verifyOTPWithoutIncrement(token: string, lookAheadWindow: number = 0): boolean {
    // Only check current counter, no look-ahead for security
    const isValid = speakeasy.hotp.verify({
      secret: this.secret,
      encoding: 'base32',
      token,
      counter: this.counter,
    });

    // Don't increment counter - allow same code to be verified multiple times
    return isValid;
  }

  /**
   * Get current counter value
   */
  getCurrentCounter(): number {
    return this.counter;
  }

  /**
   * Set counter value
   */
  setCounter(counter: number): void {
    if (counter < 0) {
      throw new Error('Counter cannot be negative');
    }
    this.counter = counter;
  }

  /**
   * Get the secret key
   */
  getSecret(): string {
    return this.secret;
  }

  /**
   * Generate provisioning URI for QR code
   */
  getProvisioningURI(name: string, issuer: string = 'OTP-App'): string {
    // Create more compatible HOTP URI
    const label = encodeURIComponent(`${issuer}:${name}`);
    const secret = this.secret;
    const counter = this.counter;
    
    return `otpauth://hotp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&counter=${counter}&digits=6&algorithm=SHA1`;
  }

  /**
   * Generate QR code as data URL
   */
  async generateQRCode(name: string, issuer: string = 'OTP-App'): Promise<string> {
    const uri = this.getProvisioningURI(name, issuer);
    return QRCode.toDataURL(uri);
  }
}


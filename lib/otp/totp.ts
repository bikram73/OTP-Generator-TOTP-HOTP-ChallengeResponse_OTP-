/**
 * TOTP (Time-based One-Time Password) Implementation
 * Complies with RFC 6238 standard
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class TOTPGenerator {
  private secret: string;
  private interval: number;

  constructor(secret?: string, interval: number = 30) {
    this.secret = secret || speakeasy.generateSecret({ length: 20 }).base32;
    this.interval = interval;
  }

  /**
   * Generate current TOTP code
   */
  generateOTP(): string {
    return speakeasy.totp({
      secret: this.secret,
      encoding: 'base32',
    });
  }

  /**
   * Verify TOTP code with strict time window (no tolerance)
   */
  verifyOTP(token: string, window: number = 0): boolean {
    return speakeasy.totp.verify({
      secret: this.secret,
      encoding: 'base32',
      token,
      window, // 0 = only current 30-second window
    });
  }

  /**
   * Get current time step for replay attack prevention
   */
  getCurrentTimeStep(): number {
    return Math.floor(Date.now() / 1000 / this.interval);
  }

  /**
   * Get remaining seconds until current OTP expires
   */
  getRemainingTime(): number {
    const now = Math.floor(Date.now() / 1000);
    return this.interval - (now % this.interval);
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
    return speakeasy.otpauthURL({
      secret: this.secret,
      encoding: 'base32',
      label: name,
      issuer,
    });
  }

  /**
   * Generate QR code as data URL
   */
  async generateQRCode(name: string, issuer: string = 'OTP-App'): Promise<string> {
    const uri = this.getProvisioningURI(name, issuer);
    return QRCode.toDataURL(uri);
  }
}


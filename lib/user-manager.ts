/**
 * User Management System
 */

import { promises as fs } from 'fs';
import path from 'path';
import { SecurityManager } from './security';
import { TOTPGenerator } from './otp/totp';
import { HOTPGenerator } from './otp/hotp';
import { ChallengeResponseOTP } from './otp/challenge-response';

interface User {
  username: string;
  email?: string;
  passwordHash: string;
  otpType: 'totp' | 'hotp' | 'challenge-response';
  otpSecretEncrypted: string;
  encryptionSalt: string;
  counter?: number;
  backupCodes: Array<{ hash: string; used: boolean }>;
  createdAt: number;
  locked: boolean;
  // Track used TOTP codes to prevent replay attacks
  usedTotpCodes: Array<{ code: string; timeStep: number; usedAt: number }>;
}

interface UserData {
  username: string;
  otpSecret: string;
  otpType: 'totp' | 'hotp' | 'challenge-response';
  backupCodes: string[];
}

export class UserManager {
  public dbFile: string;
  private security: SecurityManager;
  public users: Record<string, User> = {};

  constructor(dbFile: string = 'users.json') {
    this.dbFile = path.join(process.cwd(), dbFile);
    this.security = new SecurityManager();
  }

  /**
   * Load users from database file
   */
  async loadUsers(): Promise<void> {
    try {
      const data = await fs.readFile(this.dbFile, 'utf-8');
      this.users = JSON.parse(data);

      // Migrate existing users to add usedTotpCodes field if missing
      let needsSave = false;
      for (const username in this.users) {
        if (!this.users[username].usedTotpCodes) {
          this.users[username].usedTotpCodes = [];
          needsSave = true;
        }
      }

      if (needsSave) {
        await this.saveUsers();
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.users = {};
        await this.saveUsers();
      } else {
        throw error;
      }
    }
  }

  /**
   * Save users to database file
   */
  public async saveUsers(): Promise<void> {
    await fs.writeFile(this.dbFile, JSON.stringify(this.users, null, 2));
  }

  /**
   * Register a new user
   */
  async registerUser(
    username: string,
    password: string,
    otpType: 'totp' | 'hotp' | 'challenge-response' = 'totp',
    email?: string
  ): Promise<{ success: boolean; message: string; userData?: UserData }> {
    await this.loadUsers();

    // Validate username
    if (this.users[username]) {
      return { success: false, message: 'Username already exists' };
    }

    if (!username || username.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters' };
    }

    // Validate password strength
    const passwordValidation = this.security.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return { success: false, message: passwordValidation.message };
    }

    // Hash password
    const passwordHash = await this.security.hashPassword(password);

    // Generate OTP secret
    let secret: string;
    let counter: number | undefined;

    if (otpType === 'totp') {
      const totpGen = new TOTPGenerator();
      secret = totpGen.getSecret();
    } else if (otpType === 'hotp') {
      const hotpGen = new HOTPGenerator();
      secret = hotpGen.getSecret();
      counter = 0;
    } else if (otpType === 'challenge-response') {
      const challengeGen = new ChallengeResponseOTP();
      secret = challengeGen.getSecret();
    } else {
      return { success: false, message: 'Invalid OTP type' };
    }

    // Encrypt secret
    const { key, salt } = this.security.generateEncryptionKey(password);
    const encryptedSecret = this.security.encryptData(secret, key);

    // Generate backup codes
    const backupCodes = this.security.generateBackupCodes(10);
    const backupHashes = await Promise.all(
      backupCodes.map(async (code) => ({
        hash: await this.security.hashPassword(code),
        used: false,
      }))
    );

    // Create user record
    this.users[username] = {
      username,
      email,
      passwordHash,
      otpType,
      otpSecretEncrypted: encryptedSecret,
      encryptionSalt: salt.toString('hex'),
      counter,
      backupCodes: backupHashes,
      createdAt: Date.now(),
      locked: false,
      usedTotpCodes: [],
    };

    await this.saveUsers();

    return {
      success: true,
      message: 'User registered successfully',
      userData: {
        username,
        otpSecret: secret,
        otpType,
        backupCodes,
      },
    };
  }

  /**
   * Find user by username or email
   */
  private findUserByUsernameOrEmail(identifier: string): { username: string; user: User } | null {
    // First try to find by username (exact match)
    if (this.users[identifier]) {
      return { username: identifier, user: this.users[identifier] };
    }

    // Then try to find by email
    for (const [username, user] of Object.entries(this.users)) {
      if (user.email && user.email.toLowerCase() === identifier.toLowerCase()) {
        return { username, user };
      }
    }

    return null;
  }

  /**
   * Authenticate user (supports both username and email)
   */
  async authenticateUser(
    identifier: string, // Can be username or email
    password: string
  ): Promise<{ success: boolean; message: string; username?: string }> {
    await this.loadUsers();

    const userInfo = this.findUserByUsernameOrEmail(identifier);
    if (!userInfo) {
      return { success: false, message: 'Invalid credentials' };
    }

    const { username, user } = userInfo;

    // Check rate limiting
    const rateLimit = this.security.checkRateLimit(username);
    if (!rateLimit.allowed) {
      return { success: false, message: rateLimit.message };
    }

    // Check if account is locked
    if (user.locked) {
      return { success: false, message: 'Account is locked. Contact administrator.' };
    }

    // Verify password
    const isValid = await this.security.verifyPassword(
      password,
      user.passwordHash
    );

    if (!isValid) {
      this.security.recordFailedAttempt(username);
      return { success: false, message: 'Invalid credentials' };
    }

    this.security.resetFailedAttempts(username);
    return { success: true, message: 'Authentication successful', username };
  }

  /**
   * Get OTP generator for user
   */
  async getOTPGenerator(
    identifier: string, // Can be username or email
    password: string
  ): Promise<{ success: boolean; generator?: TOTPGenerator | HOTPGenerator | ChallengeResponseOTP; message?: string }> {
    await this.loadUsers();

    // Authenticate user
    const auth = await this.authenticateUser(identifier, password);
    if (!auth.success || !auth.username) {
      return { success: false, message: auth.message };
    }

    const username = auth.username;
    const user = this.users[username];

    // Decrypt OTP secret
    try {
      const { key } = this.security.generateEncryptionKey(
        password,
        Buffer.from(user.encryptionSalt, 'hex')
      );
      const secret = this.security.decryptData(user.otpSecretEncrypted, key);

      // Create OTP generator
      if (user.otpType === 'totp') {
        return { success: true, generator: new TOTPGenerator(secret) };
      } else if (user.otpType === 'hotp') {
        return { success: true, generator: new HOTPGenerator(secret, user.counter || 0) };
      } else if (user.otpType === 'challenge-response') {
        return { success: true, generator: new ChallengeResponseOTP(secret) };
      } else {
        return { success: false, message: 'Invalid OTP type' };
      }
    } catch (error) {
      return { success: false, message: 'Failed to decrypt OTP secret' };
    }
  }

  /**
   * Get decrypted secret key for a user
   */
  async getDecryptedSecret(username: string, password: string): Promise<string | null> {
    await this.loadUsers();

    const user = this.users[username];
    if (!user) {
      return null;
    }

    try {
      const { key } = this.security.generateEncryptionKey(
        password,
        Buffer.from(user.encryptionSalt, 'hex')
      );
      const secret = this.security.decryptData(user.otpSecretEncrypted, key);
      return secret;
    } catch (error) {
      console.error('Failed to decrypt secret:', error);
      return null;
    }
  }

  /**
   * Verify user's OTP code with replay attack prevention
   * Note: This method only works for TOTP and HOTP users
   */
  async verifyUserOTP(
    identifier: string, // Can be username or email
    password: string,
    otpCode: string
  ): Promise<{ success: boolean; message: string }> {
    await this.loadUsers();

    // Get the actual username from authentication
    const auth = await this.authenticateUser(identifier, password);
    if (!auth.success || !auth.username) {
      return { success: false, message: 'Authentication failed' };
    }

    const username = auth.username;
    const user = this.users[username];

    // Reject Challenge-Response users
    if (user.otpType === 'challenge-response') {
      return {
        success: false,
        message: 'Challenge-Response users must use the challenge verification system'
      };
    }

    const result = await this.getOTPGenerator(identifier, password);
    if (!result.success || !result.generator) {
      return { success: false, message: result.message || 'Failed to get OTP generator' };
    }

    // For TOTP, implement strict time-based verification and replay attack prevention
    if (user.otpType === 'totp' && result.generator instanceof TOTPGenerator) {
      const currentTimeStep = result.generator.getCurrentTimeStep();
      const now = Date.now();

      // Clean up old used codes (older than 2 minutes)
      user.usedTotpCodes = user.usedTotpCodes.filter(
        (usedCode) => now - usedCode.usedAt < 120000 // 2 minutes
      );

      // Check if this code was already used in this time step
      const alreadyUsed = user.usedTotpCodes.some(
        (usedCode) => usedCode.code === otpCode && usedCode.timeStep === currentTimeStep
      );

      if (alreadyUsed) {
        return { success: false, message: 'OTP code already used. Please wait for a new code.' };
      }

      // Verify the code with strict time window (window = 0)
      const isValid = result.generator.verifyOTP(otpCode, 0);

      if (isValid) {
        // Mark this code as used
        user.usedTotpCodes.push({
          code: otpCode,
          timeStep: currentTimeStep,
          usedAt: now
        });
        await this.saveUsers();
        return { success: true, message: 'OTP verified successfully' };
      } else {
        return { success: false, message: 'Invalid or expired OTP code' };
      }
    }

    // For HOTP, verify without incrementing counter (allows same code to be used multiple times)
    if (user.otpType === 'hotp') {
      if (result.generator instanceof HOTPGenerator) {
        const isValid = result.generator.verifyOTPWithoutIncrement(otpCode);

        if (isValid) {
          // Don't update counter - same code can be verified multiple times
          return { success: true, message: 'OTP verified successfully' };
        } else {
          return { success: false, message: 'Invalid OTP code' };
        }
      } else {
        return { success: false, message: 'Invalid generator type' };
      }
    }

    return { success: false, message: 'Invalid OTP type' };
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(
    username: string,
    backupCode: string
  ): Promise<{ success: boolean; message: string }> {
    await this.loadUsers();

    if (!this.users[username]) {
      return { success: false, message: 'Invalid username' };
    }

    const user = this.users[username];

    for (const backupData of user.backupCodes) {
      if (backupData.used) continue;

      const isValid = await this.security.verifyPassword(backupCode, backupData.hash);
      if (isValid) {
        backupData.used = true;
        await this.saveUsers();
        return { success: true, message: 'Backup code verified successfully' };
      }
    }

    return { success: false, message: 'Invalid or already used backup code' };
  }

  /**
   * Get user info
   */
  async getUserInfo(username: string): Promise<User | null> {
    await this.loadUsers();
    return this.users[username] || null;
  }

  /**
   * Update HOTP counter for user
   */
  async updateHOTPCounter(username: string, newCounter: number): Promise<{ success: boolean; message: string }> {
    await this.loadUsers();

    if (!this.users[username]) {
      return { success: false, message: 'User not found' };
    }

    if (this.users[username].otpType !== 'hotp') {
      return { success: false, message: 'User is not using HOTP' };
    }

    this.users[username].counter = newCounter;
    await this.saveUsers();

    return { success: true, message: 'HOTP counter updated successfully' };
  }

  /**
   * Convert HOTP user to TOTP (for better app compatibility)
   */
  async convertToTOTP(username: string): Promise<{ success: boolean; message: string }> {
    await this.loadUsers();

    if (!this.users[username]) {
      return { success: false, message: 'User not found' };
    }

    if (this.users[username].otpType !== 'hotp') {
      return { success: false, message: 'User is not using HOTP' };
    }

    // Convert to TOTP
    this.users[username].otpType = 'totp';
    delete this.users[username].counter; // Remove counter field
    this.users[username].usedTotpCodes = []; // Initialize TOTP tracking

    await this.saveUsers();

    return { success: true, message: 'Successfully converted to TOTP' };
  }

  /**
   * List all users
   */
  async listUsers(): Promise<string[]> {
    await this.loadUsers();
    return Object.keys(this.users);
  }
}


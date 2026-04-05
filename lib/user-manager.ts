/**
 * User Management System
 */

import { SecurityManager } from './security';
import { TOTPGenerator } from './otp/totp';
import { HOTPGenerator } from './otp/hotp';
import { ChallengeResponseOTP } from './otp/challenge-response';
import { getSupabaseAdminClient } from './supabase-admin';

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

interface DbUserRow {
  username: string;
  email: string | null;
  password_hash: string;
  otp_type: 'totp' | 'hotp' | 'challenge-response';
  otp_secret_encrypted: string;
  encryption_salt: string;
  counter: number | null;
  backup_codes: Array<{ hash: string; used: boolean }> | null;
  created_at: number;
  locked: boolean;
  used_totp_codes: Array<{ code: string; timeStep: number; usedAt: number }> | null;
}

export class UserManager {
  public dbFile: string;
  private security: SecurityManager;
  public users: Record<string, User> = {};

  constructor(dbFile: string = 'supabase:otp_users') {
    // Kept for backward compatibility with existing construction sites.
    this.dbFile = dbFile;
    this.security = new SecurityManager();
  }

  private rowToUser(row: DbUserRow): User {
    return {
      username: row.username,
      email: row.email || undefined,
      passwordHash: row.password_hash,
      otpType: row.otp_type,
      otpSecretEncrypted: row.otp_secret_encrypted,
      encryptionSalt: row.encryption_salt,
      counter: row.counter ?? undefined,
      backupCodes: row.backup_codes || [],
      createdAt: row.created_at,
      locked: row.locked,
      usedTotpCodes: row.used_totp_codes || [],
    };
  }

  private userToDbRow(user: User) {
    return {
      username: user.username,
      email: user.email || null,
      password_hash: user.passwordHash,
      otp_type: user.otpType,
      otp_secret_encrypted: user.otpSecretEncrypted,
      encryption_salt: user.encryptionSalt,
      counter: user.counter ?? null,
      backup_codes: user.backupCodes,
      created_at: user.createdAt,
      locked: user.locked,
      used_totp_codes: user.usedTotpCodes,
    };
  }

  private async getUserByUsername(username: string): Promise<User | null> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('otp_users')
      .select('*')
      .eq('username', username)
      .maybeSingle<DbUserRow>();

    if (error) {
      throw error;
    }

    return data ? this.rowToUser(data) : null;
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('otp_users')
      .select('*')
      .ilike('email', email)
      .maybeSingle<DbUserRow>();

    if (error) {
      throw error;
    }

    return data ? this.rowToUser(data) : null;
  }

  /**
   * Load users from Supabase into in-memory cache
   */
  async loadUsers(): Promise<void> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('otp_users')
      .select('*')
      .returns<DbUserRow[]>();

    if (error) {
      throw error;
    }

    this.users = {};
    for (const row of data || []) {
      const user = this.rowToUser(row);
      this.users[user.username] = user;
    }
  }

  /**
   * Save in-memory cache to Supabase
   */
  public async saveUsers(): Promise<void> {
    const supabase = getSupabaseAdminClient();
    const rows = Object.values(this.users).map((user) => this.userToDbRow(user));

    if (rows.length === 0) {
      return;
    }

    const { error } = await supabase.from('otp_users').upsert(rows, {
      onConflict: 'username',
    });

    if (error) {
      throw error;
    }
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
    const existingByUsername = await this.getUserByUsername(username);
    if (existingByUsername) {
      return { success: false, message: 'Username already exists' };
    }

    if (email) {
      const existingByEmail = await this.getUserByEmail(email);
      if (existingByEmail) {
        return { success: false, message: 'Email already exists' };
      }
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
    const user: User = {
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

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from('otp_users').insert(this.userToDbRow(user));
    if (error) {
      return { success: false, message: `Failed to store user: ${error.message}` };
    }

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
  private async findUserByUsernameOrEmail(identifier: string): Promise<{ username: string; user: User } | null> {
    const usernameUser = await this.getUserByUsername(identifier);
    if (usernameUser) {
      return { username: usernameUser.username, user: usernameUser };
    }

    const emailUser = await this.getUserByEmail(identifier);
    if (emailUser) {
      return { username: emailUser.username, user: emailUser };
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
    const userInfo = await this.findUserByUsernameOrEmail(identifier);
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
    // Authenticate user
    const auth = await this.authenticateUser(identifier, password);
    if (!auth.success || !auth.username) {
      return { success: false, message: auth.message };
    }

    const username = auth.username;
    const user = await this.getUserByUsername(username);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

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
    const user = await this.getUserByUsername(username);
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
    // Get the actual username from authentication
    const auth = await this.authenticateUser(identifier, password);
    if (!auth.success || !auth.username) {
      return { success: false, message: 'Authentication failed' };
    }

    const username = auth.username;
    const user = await this.getUserByUsername(username);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

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

        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
          .from('otp_users')
          .update({ used_totp_codes: user.usedTotpCodes })
          .eq('username', username);

        if (error) {
          return { success: false, message: `Failed to update TOTP usage: ${error.message}` };
        }

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
    const user = await this.getUserByUsername(username);
    if (!user) {
      return { success: false, message: 'Invalid username' };
    }

    for (const backupData of user.backupCodes) {
      if (backupData.used) continue;

      const isValid = await this.security.verifyPassword(backupCode, backupData.hash);
      if (isValid) {
        backupData.used = true;

        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
          .from('otp_users')
          .update({ backup_codes: user.backupCodes })
          .eq('username', username);

        if (error) {
          return { success: false, message: `Failed to update backup code usage: ${error.message}` };
        }

        return { success: true, message: 'Backup code verified successfully' };
      }
    }

    return { success: false, message: 'Invalid or already used backup code' };
  }

  /**
   * Get user info
   */
  async getUserInfo(username: string): Promise<User | null> {
    return this.getUserByUsername(username);
  }

  /**
   * Update HOTP counter for user
   */
  async updateHOTPCounter(username: string, newCounter: number): Promise<{ success: boolean; message: string }> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.otpType !== 'hotp') {
      return { success: false, message: 'User is not using HOTP' };
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('otp_users')
      .update({ counter: newCounter })
      .eq('username', username);

    if (error) {
      return { success: false, message: `Failed to update counter: ${error.message}` };
    }

    return { success: true, message: 'HOTP counter updated successfully' };
  }

  /**
   * Convert HOTP user to TOTP (for better app compatibility)
   */
  async convertToTOTP(username: string): Promise<{ success: boolean; message: string }> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.otpType !== 'hotp') {
      return { success: false, message: 'User is not using HOTP' };
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('otp_users')
      .update({
        otp_type: 'totp',
        counter: null,
        used_totp_codes: [],
      })
      .eq('username', username);

    if (error) {
      return { success: false, message: `Failed to convert user: ${error.message}` };
    }

    return { success: true, message: 'Successfully converted to TOTP' };
  }

  /**
   * List all users
   */
  async listUsers(): Promise<string[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('otp_users').select('username');

    if (error) {
      throw error;
    }

    return (data || []).map((row: { username: string }) => row.username);
  }
}


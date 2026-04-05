/**
 * Challenge Manager
 * Handles active challenges for users
 */

import { Challenge, ChallengeResponseOTP } from './otp/challenge-response';
import { getSupabaseAdminClient } from './supabase-admin';

interface ChallengeUserRow {
  username: string;
  secret: string;
}

interface ChallengeRow {
  id: string;
  username: string;
  challenge: string;
  context: string | null;
  created_at: number;
  expires_at: number;
  used: boolean;
}

export class ChallengeManager {
  private challengesFile: string;

  constructor(challengesFile: string = 'supabase:otp_challenges') {
    // Kept for backward compatibility with existing construction sites.
    this.challengesFile = challengesFile;
  }

  private async getUserSecret(username: string): Promise<string | null> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('otp_challenge_users')
      .select('secret')
      .eq('username', username)
      .maybeSingle<ChallengeUserRow>();

    if (error) {
      throw error;
    }

    return data?.secret || null;
  }

  private rowToChallenge(row: ChallengeRow): Challenge {
    return {
      id: row.id,
      challenge: row.challenge,
      context: row.context || undefined,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      used: row.used,
    };
  }

  /**
   * Backward-compatible no-op for old callsites
   */
  async loadChallenges(): Promise<void> {
    return;
  }

  /**
   * Backward-compatible no-op for old callsites
   */
  async saveChallenges(): Promise<void> {
    return;
  }

  /**
   * Initialize challenge-response for a user
   */
  async initializeUser(username: string, secret?: string): Promise<string> {
    const supabase = getSupabaseAdminClient();
    const existingSecret = await this.getUserSecret(username);

    if (!existingSecret) {
      const resolvedSecret = secret || new ChallengeResponseOTP().getSecret();
      const { error } = await supabase.from('otp_challenge_users').insert({
        username,
        secret: resolvedSecret,
      });

      if (error) {
        throw error;
      }

      return resolvedSecret;
    }

    // Keep ChallengeManager secret aligned with user secret when provided.
    if (secret && secret !== existingSecret) {
      const { error } = await supabase
        .from('otp_challenge_users')
        .update({ secret })
        .eq('username', username);

      if (error) {
        throw error;
      }

      return secret;
    }

    return existingSecret;
  }

  /**
   * Generate a new challenge for a user
   */
  async generateChallenge(
    username: string, 
    context?: string
  ): Promise<{ success: boolean; challenge?: Challenge; message?: string }> {
    const secret = await this.getUserSecret(username);
    if (!secret) {
      return { success: false, message: 'User not initialized for challenge-response' };
    }

    // Clean up expired challenges
    await this.cleanupExpiredChallenges(username);

    // Generate new challenge
    const generator = new ChallengeResponseOTP(secret);
    const challenge = generator.generateChallenge(context);

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from('otp_challenges').insert({
      id: challenge.id,
      username,
      challenge: challenge.challenge,
      context: challenge.context || null,
      created_at: challenge.createdAt,
      expires_at: challenge.expiresAt,
      used: challenge.used,
    });

    if (error) {
      return { success: false, message: `Failed to save challenge: ${error.message}` };
    }
    
    return { success: true, challenge };
  }

  /**
   * Verify a challenge-response
   * Note: This method should be used with caution as it uses the stored generator
   * For production, use the verify-fixed endpoint that uses UserManager secret
   */
  async verifyResponse(
    username: string, 
    challengeId: string, 
    response: string
  ): Promise<{ success: boolean; message: string }> {
    const secret = await this.getUserSecret(username);
    if (!secret) {
      return { success: false, message: 'User not found' };
    }

    const challenge = await this.getChallenge(username, challengeId);
    if (!challenge) {
      return { success: false, message: 'Challenge not found' };
    }
    
    // Check if challenge is expired or used
    if (challenge.used) {
      return { success: false, message: 'Challenge already used' };
    }

    if (Date.now() > challenge.expiresAt) {
      return { success: false, message: 'Challenge expired' };
    }
    
    // Verify the response
    const generator = new ChallengeResponseOTP(secret);
    const isValid = generator.verifyResponse(challenge, response);
    
    if (isValid) {
      // Mark challenge as used
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase
        .from('otp_challenges')
        .update({ used: true })
        .eq('id', challengeId)
        .eq('username', username);

      if (error) {
        return { success: false, message: `Failed to update challenge: ${error.message}` };
      }

      return { success: true, message: 'Challenge verified successfully' };
    } else {
      return { success: false, message: 'Invalid response or challenge expired' };
    }
  }

  /**
   * Get active challenges for a user
   */
  async getActiveChallenges(username: string): Promise<Challenge[]> {
    await this.cleanupExpiredChallenges(username);

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('otp_challenges')
      .select('*')
      .eq('username', username)
      .eq('used', false)
      .gt('expires_at', Date.now())
      .returns<ChallengeRow[]>();

    if (error) {
      throw error;
    }

    return (data || []).map((row: ChallengeRow) => this.rowToChallenge(row));
  }

  /**
   * Get challenge by ID
   */
  async getChallenge(username: string, challengeId: string): Promise<Challenge | null> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('otp_challenges')
      .select('*')
      .eq('username', username)
      .eq('id', challengeId)
      .maybeSingle<ChallengeRow>();

    if (error) {
      throw error;
    }

    return data ? this.rowToChallenge(data) : null;
  }

  /**
   * Mark challenge as used
   */
  async markChallengeAsUsed(username: string, challengeId: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('otp_challenges')
      .update({ used: true })
      .eq('username', username)
      .eq('id', challengeId);

    return !error;
  }

  /**
   * Generate QR code data for a challenge
   */
  async generateChallengeQR(username: string, challengeId: string, secret?: string): Promise<string | null> {
    const challenge = await this.getChallenge(username, challengeId);
    
    if (!challenge) {
      return null;
    }

    // Use provided secret or fall back to stored generator secret
    if (secret) {
      const { ChallengeResponseOTP } = await import('./otp/challenge-response');
      const tempGenerator = new ChallengeResponseOTP(secret);
      return tempGenerator.generateChallengeQRData(challenge);
    }

    const storedSecret = await this.getUserSecret(username);
    if (!storedSecret) {
      return null;
    }

    return new ChallengeResponseOTP(storedSecret).generateChallengeQRData(challenge);
  }

  /**
   * Get provisioning URI for initial setup
   */
  async getProvisioningURI(username: string): Promise<string | null> {
    const secret = await this.getUserSecret(username);
    if (!secret) {
      return null;
    }

    return new ChallengeResponseOTP(secret).getProvisioningURI(username);
  }

  /**
   * Clear all challenges for a user
   */
  async clearChallengesForUser(username: string): Promise<void> {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('otp_challenges')
      .delete()
      .eq('username', username);

    if (error) {
      throw error;
    }
  }

  /**
   * Clean up expired challenges
   */
  private async cleanupExpiredChallenges(username: string): Promise<void> {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('otp_challenges')
      .delete()
      .eq('username', username)
      .lt('expires_at', Date.now())
      .eq('used', false);

    if (error) {
      throw error;
    }
  }
}

export default ChallengeManager;
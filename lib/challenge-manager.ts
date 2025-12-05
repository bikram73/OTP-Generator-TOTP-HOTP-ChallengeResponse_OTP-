/**
 * Challenge Manager
 * Handles active challenges for users
 */

import { promises as fs } from 'fs';
import path from 'path';
import { Challenge, ChallengeResponseOTP } from './otp/challenge-response';

interface UserChallenges {
  [username: string]: {
    challenges: Challenge[];
    generator: ChallengeResponseOTP;
  };
}

export class ChallengeManager {
  private challengesFile: string;
  private userChallenges: UserChallenges = {};

  constructor(challengesFile: string = 'challenges.json') {
    this.challengesFile = path.join(process.cwd(), challengesFile);
  }

  /**
   * Load challenges from file
   */
  async loadChallenges(): Promise<void> {
    try {
      const data = await fs.readFile(this.challengesFile, 'utf-8');
      const savedData = JSON.parse(data);
      
      // Reconstruct ChallengeResponseOTP instances
      for (const [username, userData] of Object.entries(savedData)) {
        const { challenges, secret } = userData as any;
        this.userChallenges[username] = {
          challenges: challenges || [],
          generator: new ChallengeResponseOTP(secret)
        };
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.userChallenges = {};
        await this.saveChallenges();
      } else {
        throw error;
      }
    }
  }

  /**
   * Save challenges to file
   */
  async saveChallenges(): Promise<void> {
    const saveData: any = {};
    
    for (const [username, userData] of Object.entries(this.userChallenges)) {
      saveData[username] = {
        challenges: userData.challenges,
        secret: userData.generator.getSecret()
      };
    }
    
    await fs.writeFile(this.challengesFile, JSON.stringify(saveData, null, 2));
  }

  /**
   * Initialize challenge-response for a user
   */
  async initializeUser(username: string, secret?: string): Promise<string> {
    await this.loadChallenges();
    
    if (!this.userChallenges[username]) {
      this.userChallenges[username] = {
        challenges: [],
        generator: new ChallengeResponseOTP(secret)
      };
      await this.saveChallenges();
    }
    
    return this.userChallenges[username].generator.getSecret();
  }

  /**
   * Generate a new challenge for a user
   */
  async generateChallenge(
    username: string, 
    context?: string
  ): Promise<{ success: boolean; challenge?: Challenge; message?: string }> {
    await this.loadChallenges();
    
    if (!this.userChallenges[username]) {
      return { success: false, message: 'User not initialized for challenge-response' };
    }

    // Clean up expired challenges
    await this.cleanupExpiredChallenges(username);
    
    // Check if user has too many active challenges (DISABLED for testing)
    // const activeChallenges = this.userChallenges[username].challenges.filter(
    //   c => !c.used && Date.now() < c.expiresAt
    // );
    
    // if (activeChallenges.length >= 3) {
    //   return { success: false, message: 'Too many active challenges. Please complete or wait for expiration.' };
    // }

    // Generate new challenge
    const challenge = this.userChallenges[username].generator.generateChallenge(context);
    this.userChallenges[username].challenges.push(challenge);
    
    await this.saveChallenges();
    
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
    await this.loadChallenges();
    
    if (!this.userChallenges[username]) {
      return { success: false, message: 'User not found' };
    }

    // Find the challenge
    const challengeIndex = this.userChallenges[username].challenges.findIndex(
      c => c.id === challengeId
    );
    
    if (challengeIndex === -1) {
      return { success: false, message: 'Challenge not found' };
    }

    const challenge = this.userChallenges[username].challenges[challengeIndex];
    
    // Check if challenge is expired or used
    if (challenge.used) {
      return { success: false, message: 'Challenge already used' };
    }

    if (Date.now() > challenge.expiresAt) {
      return { success: false, message: 'Challenge expired' };
    }
    
    // Verify the response
    const isValid = this.userChallenges[username].generator.verifyResponse(challenge, response);
    
    if (isValid) {
      // Mark challenge as used
      this.userChallenges[username].challenges[challengeIndex].used = true;
      await this.saveChallenges();
      return { success: true, message: 'Challenge verified successfully' };
    } else {
      return { success: false, message: 'Invalid response or challenge expired' };
    }
  }

  /**
   * Get active challenges for a user
   */
  async getActiveChallenges(username: string): Promise<Challenge[]> {
    await this.loadChallenges();
    
    if (!this.userChallenges[username]) {
      return [];
    }

    await this.cleanupExpiredChallenges(username);
    
    return this.userChallenges[username].challenges.filter(
      c => !c.used && Date.now() < c.expiresAt
    );
  }

  /**
   * Get challenge by ID
   */
  async getChallenge(username: string, challengeId: string): Promise<Challenge | null> {
    await this.loadChallenges();
    
    if (!this.userChallenges[username]) {
      return null;
    }

    return this.userChallenges[username].challenges.find(c => c.id === challengeId) || null;
  }

  /**
   * Mark challenge as used
   */
  async markChallengeAsUsed(username: string, challengeId: string): Promise<boolean> {
    await this.loadChallenges();
    
    if (!this.userChallenges[username]) {
      return false;
    }

    const challenge = this.userChallenges[username].challenges.find(c => c.id === challengeId);
    if (challenge) {
      challenge.used = true;
      await this.saveChallenges();
      return true;
    }
    
    return false;
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

    if (!this.userChallenges[username]) {
      return null;
    }

    return this.userChallenges[username].generator.generateChallengeQRData(challenge);
  }

  /**
   * Get provisioning URI for initial setup
   */
  async getProvisioningURI(username: string): Promise<string | null> {
    await this.loadChallenges();
    
    if (!this.userChallenges[username]) {
      return null;
    }

    return this.userChallenges[username].generator.getProvisioningURI(username);
  }

  /**
   * Clean up expired challenges
   */
  private async cleanupExpiredChallenges(username: string): Promise<void> {
    if (!this.userChallenges[username]) {
      return;
    }

    const now = Date.now();
    const originalLength = this.userChallenges[username].challenges.length;
    
    this.userChallenges[username].challenges = this.userChallenges[username].challenges.filter(
      c => c.used || now < c.expiresAt
    );
    
    // Save if we removed any challenges
    if (this.userChallenges[username].challenges.length !== originalLength) {
      await this.saveChallenges();
    }
  }
}

export default ChallengeManager;
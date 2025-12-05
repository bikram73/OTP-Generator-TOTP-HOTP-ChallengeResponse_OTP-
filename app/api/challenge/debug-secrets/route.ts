import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
import { ChallengeManager } from '@/lib/challenge-manager';
import { ChallengeResponseOTP } from '@/lib/otp/challenge-response';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { username, password } = decoded;
    const userManager = new UserManager();
    const challengeManager = new ChallengeManager();
    
    // Get secret from UserManager
    const userResult = await userManager.getOTPGenerator(username, password);
    let userSecret = 'N/A';
    if (userResult.success && userResult.generator instanceof ChallengeResponseOTP) {
      userSecret = userResult.generator.getSecret();
    }
    
    // Get secret from ChallengeManager
    await challengeManager.loadChallenges();
    let challengeSecret = 'N/A';
    try {
      challengeSecret = await challengeManager.initializeUser(username);
    } catch (error) {
      challengeSecret = 'Error loading';
    }

    // Test response generation with both secrets
    const testChallenge = 'test123456789abcdef';
    
    let userResponse = 'N/A';
    if (userResult.success && userResult.generator instanceof ChallengeResponseOTP) {
      userResponse = userResult.generator.generateResponse(testChallenge);
    }
    
    let challengeResponse = 'N/A';
    try {
      const challengeGen = new ChallengeResponseOTP(challengeSecret);
      challengeResponse = challengeGen.generateResponse(testChallenge);
    } catch (error) {
      challengeResponse = 'Error generating';
    }

    return NextResponse.json({
      success: true,
      debug: {
        username: username,
        userManagerSecret: userSecret.substring(0, 10) + '...',
        challengeManagerSecret: challengeSecret.substring(0, 10) + '...',
        secretsMatch: userSecret === challengeSecret,
        testChallenge: testChallenge,
        userResponse: userResponse,
        challengeResponse: challengeResponse,
        responsesMatch: userResponse === challengeResponse
      }
    });
  } catch (error) {
    console.error('Debug secrets error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
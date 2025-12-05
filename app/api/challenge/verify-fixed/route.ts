import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
import { ChallengeManager } from '@/lib/challenge-manager';
import { ChallengeResponseOTP } from '@/lib/otp/challenge-response';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
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

    const { challengeId, response } = await request.json();
    
    if (!challengeId || !response) {
      return NextResponse.json(
        { success: false, message: 'Missing challengeId or response' },
        { status: 400 }
      );
    }

    const { username, password } = decoded;
    const userManager = new UserManager();
    const challengeManager = new ChallengeManager();
    
    // Get the challenge from ChallengeManager
    const challenge = await challengeManager.getChallenge(username, challengeId);
    
    if (!challenge) {
      return NextResponse.json(
        { success: false, message: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check if challenge is expired or used
    if (challenge.used) {
      return NextResponse.json(
        { success: false, message: 'Challenge already used' },
        { status: 400 }
      );
    }

    if (Date.now() > challenge.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Challenge expired' },
        { status: 400 }
      );
    }

    // Get the user's actual secret from UserManager
    const userResult = await userManager.getOTPGenerator(username, password);
    
    if (!userResult.success || !userResult.generator) {
      return NextResponse.json(
        { success: false, message: 'Failed to get user generator' },
        { status: 400 }
      );
    }

    if (!(userResult.generator instanceof ChallengeResponseOTP)) {
      return NextResponse.json(
        { success: false, message: 'User is not using Challenge-Response authentication' },
        { status: 400 }
      );
    }

    // Verify using the user's actual secret
    const isValid = userResult.generator.verifyResponse(challenge, response);
    
    if (isValid) {
      // Mark challenge as used in ChallengeManager
      const verifyResult = await challengeManager.verifyResponse(username, challengeId, response);
      
      return NextResponse.json({
        success: true,
        message: 'Challenge verified successfully using user secret'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid response' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verify challenge (fixed) error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
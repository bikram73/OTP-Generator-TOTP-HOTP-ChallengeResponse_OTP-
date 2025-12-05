import { NextRequest, NextResponse } from 'next/server';
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

    const { challengeId, challenge, secret, response } = await request.json();
    
    if (!challengeId || !challenge || !secret || !response) {
      return NextResponse.json(
        { success: false, message: 'Challenge ID, challenge, secret, and response are required' },
        { status: 400 }
      );
    }

    const { username } = decoded;
    const challengeManager = new ChallengeManager();
    
    // Get the stored challenge to verify it exists and is valid
    const storedChallenge = await challengeManager.getChallenge(username, challengeId);
    
    if (!storedChallenge) {
      return NextResponse.json(
        { success: false, message: 'Challenge not found' },
        { status: 404 }
      );
    }

    if (storedChallenge.used) {
      return NextResponse.json(
        { success: false, message: 'Challenge already used' },
        { status: 400 }
      );
    }

    if (Date.now() > storedChallenge.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Challenge expired' },
        { status: 400 }
      );
    }

    if (storedChallenge.challenge !== challenge) {
      return NextResponse.json(
        { success: false, message: 'Challenge mismatch' },
        { status: 400 }
      );
    }

    // Create a temporary Challenge-Response generator with the provided secret
    const generator = new ChallengeResponseOTP(secret);
    
    // Verify the response
    const isValid = generator.verifyResponse(storedChallenge, response);
    
    if (isValid) {
      // Mark challenge as used
      await challengeManager.markChallengeAsUsed(username, challengeId);
      
      return NextResponse.json({
        success: true,
        message: 'Challenge-response verification successful'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid response' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Challenge verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
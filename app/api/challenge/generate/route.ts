import { NextRequest, NextResponse } from 'next/server';
import { ChallengeManager } from '@/lib/challenge-manager';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

    const { context } = await request.json();
    const { username } = decoded;
    
    const challengeManager = new ChallengeManager();
    
    // Initialize user if not exists
    await challengeManager.initializeUser(username);
    
    // Generate challenge
    const result = await challengeManager.generateChallenge(username, context);
    
    // Generate a new short secret key for this challenge (8 characters)
    const newSecret = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    if (result.success && result.challenge) {
      return NextResponse.json({
        success: true,
        challenge: {
          id: result.challenge.id,
          challenge: result.challenge.challenge,
          context: result.challenge.context,
          expiresAt: result.challenge.expiresAt
        },
        secret: newSecret
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Generate challenge error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
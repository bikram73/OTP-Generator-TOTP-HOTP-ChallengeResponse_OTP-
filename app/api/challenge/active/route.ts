import { NextRequest, NextResponse } from 'next/server';
import { ChallengeManager } from '@/lib/challenge-manager';
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

    const { username } = decoded;
    const challengeManager = new ChallengeManager();
    
    // Get active challenges for the user
    const activeChallenges = await challengeManager.getActiveChallenges(username);
    
    // Return the most recent active challenge
    const latestChallenge = activeChallenges.length > 0 ? activeChallenges[activeChallenges.length - 1] : null;

    return NextResponse.json({
      success: true,
      challenge: latestChallenge,
      totalActive: activeChallenges.length
    });
  } catch (error) {
    console.error('Get active challenge error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
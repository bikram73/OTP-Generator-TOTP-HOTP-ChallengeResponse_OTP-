import { NextRequest, NextResponse } from 'next/server';
import { ChallengeManager } from '@/lib/challenge-manager';
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

    const { username } = decoded;
    const challengeManager = new ChallengeManager();
    
    // Load challenges
    await challengeManager.loadChallenges();
    
    // Clear all challenges for the user
    if (challengeManager.userChallenges && challengeManager.userChallenges[username]) {
      challengeManager.userChallenges[username].challenges = [];
      await challengeManager.saveChallenges();
    }

    return NextResponse.json({
      success: true,
      message: 'All challenges cleared successfully'
    });
  } catch (error) {
    console.error('Clear challenges error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
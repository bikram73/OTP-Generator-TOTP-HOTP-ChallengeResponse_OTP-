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

    const { username, password } = decoded;
    const userManager = new UserManager();
    const challengeManager = new ChallengeManager();
    
    // Get the user's actual OTP secret from UserManager
    const otpResult = await userManager.getOTPGenerator(username, password);
    
    if (!otpResult.success || !otpResult.generator) {
      return NextResponse.json(
        { success: false, message: 'Failed to get user OTP generator' },
        { status: 400 }
      );
    }

    if (!(otpResult.generator instanceof ChallengeResponseOTP)) {
      return NextResponse.json(
        { success: false, message: 'User is not using Challenge-Response authentication' },
        { status: 400 }
      );
    }

    // Get the user's secret and reinitialize ChallengeManager with it
    const userSecret = otpResult.generator.getSecret();
    await challengeManager.initializeUser(username, userSecret);

    return NextResponse.json({
      success: true,
      message: 'Challenge-Response secret synchronized successfully'
    });
  } catch (error) {
    console.error('Fix secret error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
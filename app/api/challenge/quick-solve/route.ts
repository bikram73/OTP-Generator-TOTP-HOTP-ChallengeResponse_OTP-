import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
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

    const { searchParams } = new URL(request.url);
    const challenge = searchParams.get('challenge');
    
    if (!challenge) {
      return NextResponse.json(
        { success: false, message: 'Challenge parameter is required' },
        { status: 400 }
      );
    }

    const { username, password } = decoded;
    const userManager = new UserManager();
    
    // Get the user's OTP generator
    const result = await userManager.getOTPGenerator(username, password);
    
    if (!result.success || !result.generator) {
      return NextResponse.json(
        { success: false, message: 'Failed to get user generator' },
        { status: 400 }
      );
    }

    // Check if it's a Challenge-Response generator
    if (!(result.generator instanceof ChallengeResponseOTP)) {
      return NextResponse.json(
        { success: false, message: 'User is not using Challenge-Response authentication' },
        { status: 400 }
      );
    }

    // Generate the response
    const response = result.generator.generateResponse(challenge);

    return NextResponse.json({
      success: true,
      challenge: challenge,
      response: response,
      message: `Response for challenge ${challenge} is: ${response}`
    });
  } catch (error) {
    console.error('Quick solve error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
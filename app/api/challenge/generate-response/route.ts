import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
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

    const { challenge, secret } = await request.json();
    
    if (!challenge) {
      return NextResponse.json(
        { success: false, message: 'Challenge is required' },
        { status: 400 }
      );
    }

    if (!secret) {
      return NextResponse.json(
        { success: false, message: 'Secret is required' },
        { status: 400 }
      );
    }

    // Create a temporary Challenge-Response generator with the provided secret
    const generator = new ChallengeResponseOTP(secret);

    // Generate the response for the given challenge
    const response = generator.generateResponse(challenge);

    return NextResponse.json({
      success: true,
      response: response,
      challenge: challenge
    });
  } catch (error) {
    console.error('Generate response error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
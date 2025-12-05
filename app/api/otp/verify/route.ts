import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
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

    const { otpCode } = await request.json();
    if (!otpCode) {
      return NextResponse.json(
        { success: false, message: 'OTP code required' },
        { status: 400 }
      );
    }

    const { username, password } = decoded;
    const userManager = new UserManager();
    
    // Check user's OTP type first
    const userInfo = await userManager.getUserInfo(username);
    if (!userInfo) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Reject Challenge-Response users - they should use /api/challenge/verify
    if (userInfo.otpType === 'challenge-response') {
      return NextResponse.json(
        { success: false, message: 'Challenge-Response users must use the challenge verification endpoint' },
        { status: 400 }
      );
    }

    // Only verify TOTP/HOTP users
    const result = await userManager.verifyUserOTP(username, password, otpCode);

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
import { HOTPGenerator } from '@/lib/otp/hotp';
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
    const result = await userManager.getOTPGenerator(username, password);

    if (!result.success || !result.generator) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    const user = await userManager.getUserInfo(username);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Only allow for HOTP
    if (user.otpType !== 'hotp') {
      return NextResponse.json(
        { success: false, message: 'This endpoint is only for HOTP' },
        { status: 400 }
      );
    }

    if (!(result.generator instanceof HOTPGenerator)) {
      return NextResponse.json(
        { success: false, message: 'Invalid generator type' },
        { status: 400 }
      );
    }

    // Generate next OTP and increment counter
    const otp = result.generator.generateNextOTP();
    const newCounter = result.generator.getCurrentCounter();
    
    // Update counter in database
    const updateResult = await userManager.updateHOTPCounter(username, newCounter);
    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, message: updateResult.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      otp,
      counter: newCounter,
      type: 'hotp',
      message: 'Next HOTP code generated successfully'
    });

  } catch (error) {
    console.error('Generate next HOTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
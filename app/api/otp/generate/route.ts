import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';

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

    if (user.otpType === 'totp') {
      const otp = result.generator.generateOTP();
      const remaining = result.generator.getRemainingTime();
      return NextResponse.json({
        success: true,
        otp,
        remaining,
        type: 'totp',
      });
    } else {
      // For HOTP, just show current code without incrementing
      const otp = result.generator.getCurrentOTP();
      const counter = result.generator.getCurrentCounter();

      return NextResponse.json({
        success: true,
        otp,
        counter,
        type: 'hotp',
      });
    }
  } catch (error) {
    console.error('Generate OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


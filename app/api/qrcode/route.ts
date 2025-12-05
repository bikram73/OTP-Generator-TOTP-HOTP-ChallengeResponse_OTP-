import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
import { TOTPGenerator } from '@/lib/otp/totp';
import { HOTPGenerator } from '@/lib/otp/hotp';
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

    let qrCodeDataURL: string;
    if (user.otpType === 'totp' && result.generator instanceof TOTPGenerator) {
      qrCodeDataURL = await result.generator.generateQRCode(username);
    } else if (result.generator instanceof HOTPGenerator) {
      qrCodeDataURL = await result.generator.generateQRCode(username);
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid generator type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


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

    const { username } = decoded;
    const userManager = new UserManager();
    const result = await userManager.convertToTOTP(username);

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });

  } catch (error) {
    console.error('Convert to TOTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
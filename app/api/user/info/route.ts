import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
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
    const userManager = new UserManager();
    const userInfo = await userManager.getUserInfo(username);

    if (!userInfo) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return safe user info (no sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        username: userInfo.username,
        email: userInfo.email,
        otpType: userInfo.otpType,
        createdAt: userInfo.createdAt,
        locked: userInfo.locked
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
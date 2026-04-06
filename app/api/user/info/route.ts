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
        counter: userInfo.counter,
        createdAt: userInfo.createdAt,
        locked: userInfo.locked,
        backupCodesCount: userInfo.backupCodes.length
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

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { username, email, password } = body;

    const userManager = new UserManager();
    const result = await userManager.updateUserProfile(decoded.username, decoded.password, {
      username,
      email,
      password,
    });

    if (!result.success || !result.updatedUser) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    const nextToken = jwt.sign(
      {
        username: result.updatedUser.username,
        password: password?.trim() ? password : decoded.password,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      success: true,
      message: result.message,
      user: {
        username: result.updatedUser.username,
        email: result.updatedUser.email,
        otpType: result.updatedUser.otpType,
        counter: result.updatedUser.counter,
        createdAt: result.updatedUser.createdAt,
        locked: result.updatedUser.locked,
        backupCodesCount: result.updatedUser.backupCodes.length,
      }
    });

    response.cookies.set('auth-token', nextToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error('Update user info error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const userManager = new UserManager();
    const result = await userManager.deleteUserAccount(decoded.username, decoded.password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: result.message,
    });

    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
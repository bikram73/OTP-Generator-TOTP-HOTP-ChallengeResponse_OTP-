import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';

export async function POST(request: NextRequest) {
  try {
    const { username, password, confirmPassword, email, otpType } = await request.json();

    // Validate input
    if (!username || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const userManager = new UserManager();
    const result = await userManager.registerUser(
      username,
      password,
      otpType || 'totp',
      email
    );

    if (result.success && result.userData) {
      // Store registration data in response (client will handle QR code generation)
      return NextResponse.json({
        success: true,
        message: result.message,
        userData: result.userData,
      });
    }

    return NextResponse.json(
      { success: false, message: result.message },
      { status: 400 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


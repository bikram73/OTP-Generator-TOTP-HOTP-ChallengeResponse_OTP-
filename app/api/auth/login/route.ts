import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/user-manager';
import { ChallengeManager } from '@/lib/challenge-manager';
import { ChallengeResponseOTP } from '@/lib/otp/challenge-response';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing username/email or password' },
        { status: 400 }
      );
    }

    const userManager = new UserManager();
    const result = await userManager.authenticateUser(username, password);

    if (result.success && result.username) {
      // Use the actual username (not the email if that was provided)
      const actualUsername = result.username;
      
      // Get user info to check OTP type
      const userInfo = await userManager.getUserInfo(actualUsername);
      
      if (!userInfo) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Create JWT token (storing password is needed for OTP secret decryption)
      // In a production system, consider using session storage or re-authentication
      const token = jwt.sign(
        { username: actualUsername, password }, // Use actual username for token
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set HTTP-only cookie
      const response = NextResponse.json({
        success: true,
        message: result.message,
        token,
        otpType: userInfo.otpType,
        requiresOTP: false // Changed to false - users go directly to dashboard
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
      });

      // For Challenge-Response users, initialize them in the challenge manager with their actual secret
      if (userInfo.otpType === 'challenge-response') {
        try {
          const challengeManager = new ChallengeManager();
          
          // Get the user's actual OTP secret
          const otpResult = await userManager.getOTPGenerator(actualUsername, password);
          if (otpResult.success && otpResult.generator instanceof ChallengeResponseOTP) {
            const userSecret = otpResult.generator.getSecret();
            await challengeManager.initializeUser(actualUsername, userSecret);
          } else {
            await challengeManager.initializeUser(actualUsername);
          }
        } catch (error) {
          console.error('Failed to initialize challenge-response user:', error);
        }
      }

      return response;
    }

    return NextResponse.json(
      { success: false, message: result.message },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


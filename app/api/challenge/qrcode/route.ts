import { NextRequest, NextResponse } from 'next/server';
import { ChallengeManager } from '@/lib/challenge-manager';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

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

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');
    const secret = searchParams.get('secret');
    
    if (!challengeId) {
      return NextResponse.json(
        { success: false, message: 'Missing challengeId' },
        { status: 400 }
      );
    }

    if (!secret) {
      return NextResponse.json(
        { success: false, message: 'Missing secret' },
        { status: 400 }
      );
    }

    const { username } = decoded;
    const challengeManager = new ChallengeManager();
    
    // Get QR code data for the challenge with the provided secret
    const qrData = await challengeManager.generateChallengeQR(username, challengeId, secret);
    
    if (!qrData) {
      return NextResponse.json(
        { success: false, message: 'Challenge not found or expired' },
        { status: 404 }
      );
    }

    // Generate QR code image
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
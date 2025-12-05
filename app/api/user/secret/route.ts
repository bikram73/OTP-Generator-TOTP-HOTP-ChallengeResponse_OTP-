import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { UserManager } from '@/lib/user-manager'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; password: string }
    const userManager = new UserManager()
    const user = await userManager.getUser(decoded.username)

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Get the decrypted secret key
    const secret = await userManager.getDecryptedSecret(decoded.username, decoded.password)

    if (!secret) {
      return NextResponse.json({ success: false, message: 'Secret key not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      secret: secret
    })

  } catch (error) {
    console.error('Secret fetch error:', error)
    return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
  }
}
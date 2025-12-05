/**
 * Authentication Utilities
 */

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthUser {
  username: string
  password: string
}

/**
 * Verify JWT token from cookies
 */
export async function verifyAuth(): Promise<{ authenticated: boolean; user?: AuthUser; error?: string }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return { authenticated: false, error: 'No token found' }
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
      return { authenticated: true, user: decoded }
    } catch (error) {
      return { authenticated: false, error: 'Invalid token' }
    }
  } catch (error) {
    return { authenticated: false, error: 'Authentication error' }
  }
}

/**
 * Get authenticated user from JWT
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const auth = await verifyAuth()
  return auth.authenticated && auth.user ? auth.user : null
}


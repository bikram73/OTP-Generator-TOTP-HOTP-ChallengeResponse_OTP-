'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, CheckCircle2, XCircle, AlertCircle, ArrowLeft, AlertTriangle } from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import AdvancedLoading from '@/components/ui/advanced-loading'

export default function VerifyPage() {
  const router = useRouter()
  const [otpCode, setOtpCode] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [otpType, setOtpType] = useState<'totp' | 'hotp' | 'challenge-response'>('totp')
  const [activeChallenge, setActiveChallenge] = useState<any>(null)
  const [challengeSecret, setChallengeSecret] = useState('')

  // Restore challenge state from localStorage
  const restoreChallengeState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('challenge-state')
      if (saved) {
        try {
          const state = JSON.parse(saved)
          // Check if challenge is still valid (not expired)
          if (state.challenge && state.challenge.expiresAt > Date.now()) {
            setActiveChallenge(state.challenge)
            setChallengeSecret(state.secret || '')
            console.log('✅ Restored challenge state for verification')
            return true
          } else {
            console.log('🗑️ Challenge expired, cannot verify')
          }
        } catch (error) {
          console.error('Failed to restore challenge state:', error)
        }
      }
    }
    return false
  }

  // Check user's OTP type on mount
  useEffect(() => {
    const checkUserOTPType = async () => {
      try {
        const response = await fetch('/api/user/info')
        const data = await response.json()
        
        if (!data.success) {
          router.push('/login')
          return
        }

        const userOtpType = data.user.otpType
        setOtpType(userOtpType)

        // If Challenge-Response user, restore challenge from localStorage
        if (userOtpType === 'challenge-response') {
          restoreChallengeState()
        }

        setCheckingAuth(false)
      } catch (error) {
        console.error('Failed to check user OTP type:', error)
        router.push('/login')
      }
    }

    checkUserOTPType()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      let response, data

      if (otpType === 'challenge-response') {
        if (!activeChallenge) {
          setMessage('No active challenge found. Please generate a challenge from the dashboard first.')
          setMessageType('error')
          setLoading(false)
          return
        }

        if (!challengeSecret) {
          setMessage('Challenge secret not found. Please generate a new challenge from the dashboard.')
          setMessageType('error')
          setLoading(false)
          return
        }

        response = await fetch('/api/challenge/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            challengeId: activeChallenge.id,
            challenge: activeChallenge.challenge,
            secret: challengeSecret,
            response: otpCode 
          }),
        })
      } else {
        response = await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpCode }),
        })
      }

      data = await response.json()

      if (data.success) {
        const successMessage = otpType === 'challenge-response' 
          ? 'Challenge-Response verified successfully! Your setup is working correctly.'
          : 'OTP verified successfully! Your authenticator is working correctly.'
        
        setMessage(successMessage)
        setMessageType('success')
        setOtpCode('')
        
        // Clear active challenge after successful verification
        if (otpType === 'challenge-response') {
          setActiveChallenge(null)
        }
      } else {
        setMessage(data.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Verification failed. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (checkingAuth) {
    return <AdvancedLoading variant="brand" text="Checking authentication..." color="red" />
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/50 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verify {otpType === 'totp' ? 'TOTP' : otpType === 'hotp' ? 'HOTP' : 'Challenge-Response'} Code
          </h1>
          <p className="text-gray-400">
            {otpType === 'challenge-response' 
              ? 'Enter the response code for your active challenge'
              : `Test your ${otpType === 'totp' ? 'time-based' : 'counter-based'} OTP codes to ensure they work correctly`
            }
          </p>
        </div>



        {/* Show active challenge for Challenge-Response users */}
        {otpType === 'challenge-response' && activeChallenge && (
          <div className="mb-6 p-4 bg-orange-900/20 border border-orange-800 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-orange-400" />
              <h3 className="font-medium text-orange-300">Active Challenge</h3>
            </div>
            <div className="font-mono text-sm text-orange-200 break-all mb-2">
              {activeChallenge.challenge}
            </div>
            <p className="text-xs text-orange-300">
              Context: {activeChallenge.context || 'Authentication Challenge'}
            </p>
          </div>
        )}

        {/* Show message if no active challenge for Challenge-Response users */}
        {otpType === 'challenge-response' && !activeChallenge && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">No Active Challenge</p>
              <p className="text-sm text-red-200 mt-1">
                Please generate a challenge from the{' '}
                <Link href="/dashboard" className="underline hover:text-red-100">
                  dashboard
                </Link>{' '}
                first, then return here to verify the response.
              </p>
            </div>
          </div>
        )}

        {/* Verification Form */}
        <div className="relative">
          <MagicCard
            className="p-8"
            gradientSize={300}
            gradientFrom="#dc2626"
            gradientTo="#b91c1c"
            gradientColor="#7f1d1d"
            gradientOpacity={0.2}
          >
            <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                messageType === 'success'
                  ? 'bg-green-900/20 border border-green-800'
                  : 'bg-red-900/30 border border-red-700'
              }`}
            >
              {messageType === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-medium ${
                    messageType === 'success' ? 'text-green-300' : 'text-red-300'
                  }`}
                >
                  {messageType === 'success' ? 'Verification successful' : 'Verification failed'}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    messageType === 'success' ? 'text-green-200' : 'text-red-200'
                  }`}
                >
                  {message}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otpCode" className="block text-sm font-medium text-gray-300 mb-3 text-center">
                Enter OTP Code
              </label>
              <input
                id="otpCode"
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="block w-full px-4 py-4 text-center text-3xl font-mono tracking-widest border-2 border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
                placeholder="000000"
                autoComplete="one-time-code"
              />
              <p className="mt-2 text-xs text-center text-gray-400">
                {otpType === 'totp' 
                  ? 'Enter the current 6-digit code from your authenticator app to test verification'
                  : 'Enter the 6-digit HOTP code to test verification (generate new code if needed)'
                }
              </p>
            </div>

              <ShimmerButton
                type="submit"
                disabled={loading || otpCode.length !== 6}
                background="rgba(220, 38, 38, 1)"
                shimmerColor="#dc2626"
                shimmerDuration="3s"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" variant="default" />
                    Verifying...
                  </div>
                ) : (
                  'Verify Code'
                )}
              </ShimmerButton>
          </form>
            </div>
          </MagicCard>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

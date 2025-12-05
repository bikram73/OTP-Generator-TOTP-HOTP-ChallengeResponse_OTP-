'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, QrCode, CheckCircle2, LogOut, RefreshCw, Copy, Clock, Hash, Settings, ChevronUp, ChevronDown } from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'
import AdvancedLoading from '@/components/ui/advanced-loading'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DashboardPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [remaining, setRemaining] = useState(30)
  const [otpType, setOtpType] = useState<'totp' | 'hotp' | 'challenge-response'>('totp')
  const [counter, setCounter] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  // Challenge-Response specific state
  const [challenge, setChallenge] = useState<any>(null)
  const [challengeTimeRemaining, setChallengeTimeRemaining] = useState(0)
  const [challengeResponse, setChallengeResponse] = useState('')
  const [showSteps, setShowSteps] = useState(false)
  const [secretKey, setSecretKey] = useState('')
  const [showSecretSections, setShowSecretSections] = useState(false)

  // Save challenge state to localStorage
  const saveChallengeState = (challengeData: any, secretData: string, responseData: string) => {
    if (typeof window !== 'undefined') {
      const state = {
        challenge: challengeData,
        secret: secretData,
        response: responseData,
        timestamp: Date.now()
      }
      localStorage.setItem('challenge-state', JSON.stringify(state))
    }
  }

  // Restore challenge state from localStorage
  const restoreChallengeState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('challenge-state')
      if (saved) {
        try {
          const state = JSON.parse(saved)
          // Check if challenge is still valid (not expired)
          if (state.challenge && state.challenge.expiresAt > Date.now()) {
            setChallenge(state.challenge)
            setChallengeTimeRemaining(state.challenge.expiresAt - Date.now())
            if (state.secret) {
              setSecretKey(state.secret)
            }
            if (state.response) {
              setChallengeResponse(state.response)
            }
            console.log('✅ Restored challenge state from localStorage')
            return true
          } else {
            // Clear expired challenge
            localStorage.removeItem('challenge-state')
            console.log('🗑️ Cleared expired challenge from localStorage')
          }
        } catch (error) {
          console.error('Failed to restore challenge state:', error)
          localStorage.removeItem('challenge-state')
        }
      }
    }
    return false
  }

  // Clear challenge state from localStorage
  const clearChallengeState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('challenge-state')
    }
  }

  const generateOTP = async () => {
    console.log('🔄 Refresh button clicked - generating OTP...')
    try {
      setLoading(true) // Add loading state for refresh button
      const response = await fetch('/api/otp/generate')
      const data = await response.json()
      console.log('📡 OTP API response:', data)

      if (data.success) {
        setOtp(data.otp)
        setRemaining(data.remaining || 30)
        setOtpType(data.type)
        if (data.counter !== undefined) {
          setCounter(data.counter)
        }
        console.log('✅ OTP updated successfully:', data.otp)
      } else {
        console.error('❌ Failed to generate OTP:', data.message)
        if (data.message === 'Not authenticated' || data.message === 'Invalid token') {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('💥 Failed to generate OTP:', error)
    } finally {
      setLoading(false)
      console.log('🏁 Loading state set to false')
    }
  }

  const generateNextHOTP = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/otp/generate-next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (data.success) {
        setOtp(data.otp)
        setCounter(data.counter)
      } else {
        console.error('Failed to generate next HOTP:', data.message)
        if (data.message === 'Not authenticated' || data.message === 'Invalid token') {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Failed to generate next HOTP:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/info')
        const data = await response.json()
        if (!data.success && (data.message === 'Not authenticated' || data.message === 'Invalid token')) {
          router.push('/login')
          return
        }
        
        // Set OTP type from user info
        if (data.user && data.user.otpType) {
          setOtpType(data.user.otpType)
        }
        
        // For challenge-response users, try to restore previous challenge
        if (data.user && data.user.otpType === 'challenge-response') {
          const restored = restoreChallengeState()
          if (!restored) {
            console.log('💡 No valid challenge found, generate a new one when ready')
          }
          setLoading(false)
        } else if (data.user && data.user.otpType !== 'challenge-response') {
          await generateOTP()
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setLoading(false) // Ensure loading is set to false even on error
        router.push('/login')
      }
    }
    
    checkAuth()

    const interval = setInterval(() => {
      if (otpType === 'totp') {
        setRemaining((prev) => {
          if (prev <= 1) {
            generateOTP() // Only auto-refresh for TOTP
            return 30
          }
          return prev - 1
        })
      } else if (otpType === 'challenge-response' && challenge) {
        const remaining = Math.max(0, challenge.expiresAt - Date.now())
        setChallengeTimeRemaining(remaining)
        if (remaining === 0) {
          setChallenge(null) // Clear expired challenge
        }
      }
      // For HOTP, do nothing - no auto-refresh
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpType, router, challenge])

  const handleLogout = () => {
    clearChallengeState() // Clear saved challenge on logout
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/')
  }

  const copyOTP = () => {
    navigator.clipboard.writeText(otp)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateChallenge = async () => {
    try {
      setLoading(true)
      setChallengeResponse('') // Clear previous response
      setSecretKey('') // Clear previous secret
      clearChallengeState() // Clear old saved state
      
      const response = await fetch('/api/challenge/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: 'Dashboard Authentication Challenge' }),
      })

      const data = await response.json()

      if (data.success) {
        setChallenge(data.challenge)
        setChallengeTimeRemaining(data.challenge.expiresAt - Date.now())
        // Set the new secret key from the challenge response
        if (data.secret) {
          setSecretKey(data.secret)
          console.log('✅ New secret key generated:', data.secret)
          // Save the new challenge state
          saveChallengeState(data.challenge, data.secret, '')
        }
      } else {
        console.error('Failed to generate challenge:', data.message)
        if (data.message === 'Not authenticated' || data.message === 'Invalid token') {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Failed to generate challenge:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyChallenge = () => {
    if (challenge) {
      navigator.clipboard.writeText(challenge.challenge)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateResponseForChallenge = async (challengeCode: string) => {
    try {
      if (!secretKey) {
        console.error('No secret key available')
        return
      }

      const response = await fetch('/api/challenge/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge: challengeCode, secret: secretKey }),
      })

      const data = await response.json()

      if (data.success) {
        setChallengeResponse(data.response)
        // Update saved state with the response
        if (challenge) {
          saveChallengeState(challenge, secretKey, data.response)
        }
      } else {
        console.error('Failed to generate response:', data.message)
      }
    } catch (error) {
      console.error('Failed to generate response:', error)
    }
  }

  const generateResponse = async () => {
    if (!challenge) return

    try {
      setLoading(true)
      setShowSteps(true)
      
      await generateResponseForChallenge(challenge.challenge)
    } catch (error) {
      console.error('Failed to generate response:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResponse = () => {
    if (challengeResponse) {
      navigator.clipboard.writeText(challengeResponse)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const fetchSecretKey = async () => {
    try {
      console.log('🔑 Fetching secret key...')
      const response = await fetch('/api/user/secret')
      const data = await response.json()
      console.log('🔑 Secret key response:', data)
      if (data.success) {
        setSecretKey(data.secret)
        console.log('✅ Secret key loaded:', data.secret)
      } else {
        console.error('❌ Failed to fetch secret key:', data.message)
      }
    } catch (error) {
      console.error('💥 Failed to fetch secret key:', error)
    }
  }

  const copySecretKey = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <AdvancedLoading variant="brand" text="Loading Dashboard..." color="red" />
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">SecureAuth Pro</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Generate and manage your one-time passwords</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* OTP Display Card */}
          <div className="lg:col-span-2">
            <div className="relative">
              <MagicCard
                className="p-8"
                gradientSize={400}
                gradientFrom="#dc2626"
                gradientTo="#b91c1c"
                gradientColor="#7f1d1d"
                gradientOpacity={0.2}
              >
                <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Current OTP Code</h2>
                <button
                  onClick={generateOTP}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="text-center py-8">
                {otpType === 'challenge-response' ? (
                  <div className="space-y-6">
                    {/* Challenge Display */}
                    <div className="relative">
                      <div className="text-center mb-2">
                        <span className="text-sm text-gray-400 font-medium">Challenge Code</span>
                      </div>
                      <div className="relative inline-block w-full">
                        <div className="text-4xl md:text-5xl font-mono font-bold text-white p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
                          {challenge ? challenge.challenge : 'Click Generate to create challenge'}
                        </div>
                        {challenge && (
                          <button
                            onClick={copyChallenge}
                            className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            title="Copy Challenge"
                          >
                            {copied ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Response Display */}
                    {challengeResponse && (
                      <div className="relative">
                        <div className="text-center mb-2">
                          <span className="text-sm text-orange-400 font-medium">Response Code</span>
                          <span className="text-xs text-gray-500 block">Generated from combined string</span>
                        </div>
                        <div className="relative inline-block w-full">
                          <div className="text-4xl md:text-5xl font-mono font-bold text-orange-400 p-4 bg-orange-900/20 rounded-lg border border-orange-800 text-center">
                            {challengeResponse}
                          </div>
                          <button
                            onClick={copyResponse}
                            className="absolute top-2 right-2 p-2 bg-orange-800 hover:bg-orange-700 rounded-lg transition-colors"
                            title="Copy Response"
                          >
                            {copied ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Secret Key Display */}
                    <div className="relative">
                      <div className="text-center mb-2 relative">
                        <span className="text-sm text-blue-400 font-medium">Secret Key</span>
                        <button
                          onClick={() => setShowSecretSections(!showSecretSections)}
                          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          title={showSecretSections ? "Hide Secret Sections" : "Show Secret Sections"}
                        >
                          {showSecretSections ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {showSecretSections && (
                        <div className="relative inline-block w-full">
                          <div className="text-lg md:text-xl font-mono font-bold text-blue-400 p-4 bg-blue-900/20 rounded-lg border border-blue-800 text-center break-all">
                            {secretKey || 'Loading secret key...'}
                          </div>
                          {secretKey && (
                            <button
                              onClick={copySecretKey}
                              className="absolute top-2 right-2 p-2 bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors"
                              title="Copy Secret Key"
                            >
                              {copied ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Combined String Display */}
                    {challenge && showSecretSections && (
                      <div className="relative">
                        <div className="text-center mb-2">
                          <span className="text-sm text-purple-400 font-medium">Combined String</span>
                          <span className="text-xs text-gray-500 block">secret:challenge</span>
                        </div>
                        <div className="relative inline-block w-full">
                          <div className="text-lg md:text-xl font-mono font-bold text-purple-400 p-4 bg-purple-900/20 rounded-lg border border-purple-800 text-center break-all">
                            {secretKey ? `${secretKey}:${challenge.challenge}` : `[Loading...]:${challenge.challenge}`}
                          </div>
                          {secretKey && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${secretKey}:${challenge.challenge}`)
                                setCopied(true)
                                setTimeout(() => setCopied(false), 2000)
                              }}
                              className="absolute top-2 right-2 p-2 bg-purple-800 hover:bg-purple-700 rounded-lg transition-colors"
                              title="Copy Combined String"
                            >
                              {copied ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <div className="text-6xl md:text-7xl font-mono font-bold text-white mb-6 tracking-wider">
                      {otp || '------'}
                    </div>
                    <button
                      onClick={copyOTP}
                      className="absolute -top-2 -right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                      title="Copy OTP"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-red-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}

                {otpType === 'totp' && (
                  <div className="mt-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-2xl font-semibold text-white">{remaining}s</span>
                      <span className="text-gray-400">remaining</span>
                    </div>
                    <div className="w-full max-w-xs mx-auto h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000 ease-linear"
                        style={{ width: `${(remaining / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {otpType === 'hotp' && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Hash className="w-5 h-5" />
                      <span className="text-lg">Counter: <span className="font-semibold text-white">{counter}</span></span>
                    </div>
                    <button
                      onClick={generateNextHOTP}
                      disabled={loading}
                      className="mx-auto flex items-center gap-2 px-6 py-3 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-800 rounded-lg transition-colors font-medium"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" variant="default" />
                      ) : (
                        <RefreshCw className="w-5 h-5" />
                      )}
                      Generate Next Code
                    </button>
                  </div>
                )}

                {otpType === 'challenge-response' && (
                  <div className="mt-6 space-y-4">
                    {challenge && (
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-2xl font-semibold text-white">
                          {Math.floor(challengeTimeRemaining / 60000)}:{String(Math.floor((challengeTimeRemaining % 60000) / 1000)).padStart(2, '0')}
                        </span>
                        <span className="text-gray-400">remaining</span>
                      </div>
                    )}
                    
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={generateChallenge}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-800 rounded-lg transition-colors font-medium"
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" variant="default" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                        {challenge ? 'New Challenge' : 'Generate Challenge'}
                      </button>
                      
                      {challenge && (
                        <button
                          onClick={generateResponse}
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition-colors font-medium"
                        >
                          {loading ? (
                            <LoadingSpinner size="sm" variant="default" />
                          ) : (
                            <RefreshCw className="w-5 h-5" />
                          )}
                          Generate Response
                        </button>
                      )}
                    </div>
                    
                    {challenge && (
                      <button
                        onClick={() => setShowSteps(!showSteps)}
                        className="mx-auto flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        {showSteps ? 'Hide' : 'Show'} How It Works
                      </button>
                    )}
                  </div>
                )}
              </div>
                </div>
              </MagicCard>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-900/20 transition-colors group"
                >
                  <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center group-hover:bg-purple-800/50 transition-colors">
                    <Settings className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Settings</div>
                    <div className="text-sm text-gray-400">Account & preferences</div>
                  </div>
                </Link>

                {otpType !== 'challenge-response' && (
                  <>
                    <Link
                      href="/verify"
                      className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:border-green-500 hover:bg-green-900/20 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center group-hover:bg-green-800/50 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Test {otpType === 'totp' ? 'TOTP' : 'HOTP'} Verification</div>
                        <div className="text-sm text-gray-400">Test your {otpType === 'totp' ? 'time-based' : 'counter-based'} codes</div>
                      </div>
                    </Link>

                    <Link
                      href="/qrcode"
                      className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-900/20 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center group-hover:bg-blue-800/50 transition-colors">
                        <QrCode className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Setup QR Code</div>
                        <div className="text-sm text-gray-400">Scan with authenticator app</div>
                      </div>
                    </Link>
                  </>
                )}

                {otpType === 'challenge-response' && (
                  <>
                    <Link
                      href="/verify"
                      className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:border-green-500 hover:bg-green-900/20 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center group-hover:bg-green-800/50 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Verify Challenge-Response</div>
                        <div className="text-sm text-gray-400">Verify challenge responses</div>
                      </div>
                    </Link>

                    <Link
                      href="/qrcode"
                      className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-900/20 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center group-hover:bg-blue-800/50 transition-colors">
                        <QrCode className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Challenge QR Code</div>
                        <div className="text-sm text-gray-400">QR code for current challenge</div>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-300 mb-1">Security Status</h4>
                  <p className="text-sm text-red-200 mb-2">
                    Your account is secure and protected with {otpType === 'challenge-response' ? 'Challenge-Response' : otpType.toUpperCase()} authentication.
                  </p>
                  {otpType === 'hotp' && (
                    <p className="text-xs text-red-300 bg-red-900/30 rounded px-2 py-1">
                      💡 HOTP codes don't expire automatically. Click "Generate Next Code" to get a new one.
                    </p>
                  )}
                  {otpType === 'totp' && (
                    <p className="text-xs text-red-300 bg-red-900/30 rounded px-2 py-1">
                      ⏰ TOTP codes refresh automatically every 30 seconds.
                    </p>
                  )}
                  {otpType === 'challenge-response' && (
                    <p className="text-xs text-red-300 bg-red-900/30 rounded px-2 py-1">
                      🛡️ Challenge-Response provides maximum security with unique challenges for each authentication.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How Challenge-Response Works */}
        {otpType === 'challenge-response' && showSteps && challenge && (
          <div className="mt-8 bg-gray-900 rounded-xl p-8 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">How Challenge-Response Works</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Technical Process */}
              <div>
                <h4 className="text-lg font-medium text-blue-400 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Technical Process
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-white font-medium">Server generates challenge</p>
                      <p className="text-gray-400 text-sm">8-character random hex string</p>
                      <div className="mt-2 p-2 bg-gray-800 rounded text-lg font-mono text-gray-300 text-center">
                        {challenge.challenge}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-white font-medium">Combine with secret</p>
                      <p className="text-gray-400 text-sm">secret + ":" + challenge</p>
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono text-gray-300">
                        {secretKey ? `${secretKey}:${challenge.challenge}` : `[your-secret]:${challenge.challenge}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-white font-medium">Generate HMAC-SHA256</p>
                      <p className="text-gray-400 text-sm">Cryptographic hash function</p>
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono text-gray-300">
                        HMAC-SHA256(secret, challenge) → hash
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="text-white font-medium">Extract 6-digit code</p>
                      <p className="text-gray-400 text-sm">Dynamic truncation algorithm</p>
                      {challengeResponse && (
                        <div className="mt-2 p-2 bg-orange-900/20 border border-orange-800 rounded text-lg font-mono text-orange-400 text-center">
                          {challengeResponse}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Instructions */}
              <div>
                <h4 className="text-lg font-medium text-green-400 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  How to Calculate Response Manually
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-white font-medium">Get your secret key</p>
                      <p className="text-gray-400 text-sm">From registration or QR code setup</p>
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300">
                        🔑 Your Key: {secretKey || 'A1B2C3D4'} (8-character hex)
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-white font-medium">Combine secret + challenge</p>
                      <p className="text-gray-400 text-sm">Format: secret:challenge</p>
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono text-gray-300">
                        {secretKey || 'A1B2C3D4'}:{challenge.challenge}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-white font-medium">Use online HMAC calculator</p>
                      <p className="text-gray-400 text-sm">Visit: cryptii.com or freeformatter.com</p>
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300">
                        🌐 Algorithm: HMAC-SHA256<br/>
                        🔤 Key: {secretKey || 'A1B2C3D4'}<br/>
                        📝 Message: {secretKey || 'A1B2C3D4'}:{challenge.challenge}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="text-white font-medium">Extract 6 digits from hash</p>
                      <p className="text-gray-400 text-sm">Take last hex digit as offset, extract 8 chars</p>
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono text-gray-300">
                        📊 Hash: abc123...def7<br/>
                        🎯 Offset: 7 (last digit)<br/>
                        ✂️ Extract: 8 chars from position 7<br/>
                        🔢 Convert to number % 1000000
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      5
                    </div>
                    <div>
                      <p className="text-white font-medium">Your response code</p>
                      <p className="text-gray-400 text-sm">Pad with zeros if needed (6 digits)</p>
                      {challengeResponse && (
                        <div className="mt-2 p-2 bg-green-900/20 border border-green-800 rounded text-lg font-mono text-green-400 text-center">
                          ✅ Result: {challengeResponse}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Manual Calculation Tools */}
                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <h5 className="text-yellow-400 font-medium mb-2">🛠️ Manual Calculation Tools:</h5>
                  <div className="space-y-2 text-sm text-yellow-200">
                    <p><strong>Online HMAC Calculators:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-yellow-300 ml-4">
                      <li>cryptii.com/pipes/hmac → Select SHA-256</li>
                      <li>freeformatter.com/hmac-generator.html</li>
                      <li>codebeautify.org/hmac-generator</li>
                    </ul>
                    <p className="mt-3"><strong>Programming Languages:</strong></p>
                    <div className="bg-gray-800 rounded p-2 text-xs font-mono text-gray-300 mt-2">
                      <div>JavaScript: crypto.createHmac('sha256', key).update(data).digest('hex')</div>
                      <div>Python: hmac.new(key, data, hashlib.sha256).hexdigest()</div>
                      <div>PHP: hash_hmac('sha256', data, key)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Calculator Example */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <h4 className="text-lg font-medium text-purple-400 mb-4 text-center">📝 Step-by-Step Calculation Example</h4>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-white mb-3">Input Values:</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Secret Key:</span>
                        <span className="font-mono text-blue-400">{secretKey || 'A1B2C3D4'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Challenge:</span>
                        <span className="font-mono text-orange-400">{challenge.challenge}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Combined:</span>
                        <span className="font-mono text-gray-300 text-xs">secret:challenge</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-white mb-3">Calculation Steps:</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">1. HMAC-SHA256:</span>
                        <span className="font-mono text-yellow-400">abc123...def7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">2. Last digit (offset):</span>
                        <span className="font-mono text-yellow-400">7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">3. Extract 8 chars:</span>
                        <span className="font-mono text-yellow-400">23def789</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">4. Convert to int:</span>
                        <span className="font-mono text-yellow-400">598123456</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">5. Modulo 1000000:</span>
                        <span className="font-mono text-green-400 text-lg">{challengeResponse || '123456'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded">
                  <p className="text-sm text-blue-300">
                    <strong>💡 Pro Tip:</strong> You can verify this calculation using any HMAC-SHA256 calculator online. 
                    The algorithm is standardized and will produce the same result every time.
                  </p>
                </div>
              </div>
            </div>

            {/* Real-World Examples */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <h4 className="text-lg font-medium text-orange-400 mb-4 text-center">Real-World Examples</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-2">🏦 Banking</h5>
                  <p className="text-sm text-gray-400">
                    "Transfer $50,000 to Account 12345" - Challenge includes transaction details for verification
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-2">🏢 Corporate</h5>
                  <p className="text-sm text-gray-400">
                    "Delete user admin@company.com" - Challenge for sensitive administrative actions
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-2">🔐 API Access</h5>
                  <p className="text-sm text-gray-400">
                    "Export financial data" - Challenge for accessing sensitive API endpoints
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

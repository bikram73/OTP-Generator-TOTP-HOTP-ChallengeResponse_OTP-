'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, ArrowLeft, RefreshCw, CheckCircle2, Clock, AlertTriangle, Copy, QrCode } from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import AdvancedLoading from '@/components/ui/advanced-loading'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Challenge {
  id: string
  challenge: string
  context?: string
  expiresAt: number
}

export default function ChallengePage() {
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [response, setResponse] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/info')
        const data = await response.json()

        if (!data.success) {
          router.push('/login')
          return
        }

        setCheckingAuth(false)
      } catch (error) {
        console.error('Failed to check authentication:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (challenge) {
      interval = setInterval(() => {
        const remaining = Math.max(0, challenge.expiresAt - Date.now())
        setTimeRemaining(remaining)
        if (remaining === 0) {
          setChallenge(null)
          setQrCode('')
          setMessage('Challenge expired. Please generate a new one.')
          setMessageType('error')
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [challenge])

  const generateChallenge = async (context?: string) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/challenge/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: context || 'Authentication Challenge' }),
      })

      const data = await response.json()

      if (data.success) {
        setChallenge(data.challenge)
        setTimeRemaining(data.challenge.expiresAt - Date.now())

        // Generate QR code for the challenge
        const qrResponse = await fetch(`/api/challenge/qrcode?challengeId=${data.challenge.id}`)
        const qrData = await qrResponse.json()

        if (qrData.success) {
          setQrCode(qrData.qrCode)
        }
      } else {
        setMessage(data.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Failed to generate challenge')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const verifyResponse = async () => {
    if (!challenge || !response) return

    setVerifying(true)
    setMessage('')

    try {
      const res = await fetch('/api/challenge/verify-fixed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          response: response.trim()
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage('Challenge verified successfully! Your Challenge-Response setup is working correctly.')
        setMessageType('success')
        setResponse('')
        setChallenge(null)
        setQrCode('')
      } else {
        setMessage(data.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Verification failed')
      setMessageType('error')
    } finally {
      setVerifying(false)
    }
  }

  const copyChallenge = () => {
    if (challenge) {
      navigator.clipboard.writeText(challenge.challenge)
    }
  }

  const generateResponseForTesting = async () => {
    if (!challenge) return

    try {
      const response = await fetch('/api/challenge/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge: challenge.challenge }),
      })

      const data = await response.json()

      if (data.success) {
        setResponse(data.response)
        setMessage(`Generated response: ${data.response}. You can now verify it!`)
        setMessageType('success')
      } else {
        setMessage(data.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Failed to generate response')
      setMessageType('error')
    }
  }



  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Show loading while checking authentication
  if (checkingAuth) {
    return <AdvancedLoading variant="brand" text="Checking authentication..." color="red" />
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
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Challenge-Response Authentication</h1>
          <p className="text-gray-400">Generate challenges and verify responses for secure authentication</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Challenge Generation */}
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-900/50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Generate Challenge</h2>
                    <p className="text-sm text-gray-400">Create a new authentication challenge</p>
                  </div>
                </div>

                {!challenge ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-6">
                      Generate a unique challenge for secure authentication. Each challenge is valid for 5 minutes.
                    </p>
                    <ShimmerButton
                      onClick={() => generateChallenge()}
                      disabled={loading}
                      background="rgba(234, 88, 12, 1)"
                      shimmerColor="#ea580c"
                      shimmerDuration="3s"
                      className="px-6 py-3"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <LoadingSpinner size="sm" variant="default" />
                          Generating...
                        </div>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Generate Challenge
                        </>
                      )}
                    </ShimmerButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Challenge Display */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Challenge Code</span>
                        <button
                          onClick={copyChallenge}
                          className="text-gray-400 hover:text-white"
                          title="Copy challenge"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-mono text-lg text-white break-all">
                        {challenge.challenge}
                      </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-3 p-4 bg-orange-900/20 border border-orange-800 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <span className="text-orange-300 font-medium">
                        Expires in: {formatTime(timeRemaining)}
                      </span>
                    </div>

                    {/* Context */}
                    {challenge.context && (
                      <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                        <span className="text-sm text-blue-300">Context: {challenge.context}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => generateChallenge()}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Generate New Challenge
                      </button>

                      <button
                        onClick={generateResponseForTesting}
                        disabled={!challenge || loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 rounded-lg transition-colors text-sm"
                      >
                        <Shield className="w-4 h-4" />
                        Generate Response (Test)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </MagicCard>
          </div>

          {/* QR Code & Response */}
          <div className="space-y-6">
            {/* QR Code */}
            {qrCode && (
              <div className="relative">
                <MagicCard
                  className="p-8"
                  gradientSize={400}
                  gradientFrom="#3b82f6"
                  gradientTo="#1d4ed8"
                  gradientColor="#1e40af"
                  gradientOpacity={0.2}
                >
                  <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Challenge QR Code</h3>
                        <p className="text-sm text-gray-400">Scan with your authenticator</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="inline-block p-4 bg-white rounded-lg">
                        <img src={qrCode} alt="Challenge QR Code" className="w-48 h-48" />
                      </div>
                      <p className="text-sm text-gray-400 mt-4">
                        Scan this QR code with a compatible authenticator app to generate the response
                      </p>
                    </div>
                  </div>
                </MagicCard>
              </div>
            )}

            {/* Response Input */}
            {challenge && (
              <div className="relative">
                <MagicCard
                  className="p-8"
                  gradientSize={400}
                  gradientFrom="#10b981"
                  gradientTo="#059669"
                  gradientColor="#065f46"
                  gradientOpacity={0.2}
                >
                  <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Enter Response</h3>
                        <p className="text-sm text-gray-400">Input the generated response code</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="text"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Enter 6-digit response"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-green-500/20 text-center text-lg font-mono"
                      />

                      <ShimmerButton
                        onClick={verifyResponse}
                        disabled={verifying || !response || response.length !== 6}
                        background="rgba(16, 185, 129, 1)"
                        shimmerColor="#10b981"
                        shimmerDuration="3s"
                        className="w-full"
                      >
                        {verifying ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" variant="default" />
                            Verifying...
                          </div>
                        ) : (
                          'Verify Response'
                        )}
                      </ShimmerButton>
                    </div>
                  </div>
                </MagicCard>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${messageType === 'success'
            ? 'bg-green-900/20 border border-green-800'
            : 'bg-red-900/20 border border-red-800'
            }`}>
            {messageType === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${messageType === 'success' ? 'text-green-300' : 'text-red-300'
                }`}>
                {messageType === 'success' ? 'Success' : 'Error'}
              </p>
              <p className={`text-sm mt-1 ${messageType === 'success' ? 'text-green-200' : 'text-red-200'
                }`}>
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gray-900 rounded-xl p-8 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">How Challenge-Response Works</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-400">
            <div>
              <h4 className="font-medium text-white mb-2">1. Challenge Generation</h4>
              <p>Server generates a unique, random challenge code that expires in 5 minutes.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">2. QR Code Scanning</h4>
              <p>Scan the QR code with a compatible authenticator app to receive the challenge.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">3. Response Generation</h4>
              <p>Your authenticator uses the shared secret and challenge to generate a response.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">4. Verification</h4>
              <p>Server verifies the response using the same calculation method.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
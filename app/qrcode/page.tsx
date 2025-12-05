'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QrCode, ArrowLeft, Download, AlertCircle, Shield, Copy, CheckCircle2 } from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'
import AdvancedLoading from '@/components/ui/advanced-loading'
import QRCodeLib from 'qrcode'

export default function QRCodePage() {
  const router = useRouter()
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [otpType, setOtpType] = useState<'totp' | 'hotp' | 'challenge-response'>('totp')
  const [activeChallenge, setActiveChallenge] = useState<any>(null)
  const [challengeSecret, setChallengeSecret] = useState('')
  const [challengeResponse, setChallengeResponse] = useState('')
  const [qrCodeImage, setQrCodeImage] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkUserTypeAndFetchQR()
  }, [])

  // Generate QR code when challenge data is available
  useEffect(() => {
    if (otpType === 'challenge-response' && activeChallenge && challengeSecret) {
      const qrData = generateChallengeQRData(activeChallenge, challengeSecret, challengeResponse)
      setQrCode(qrData)
      generateQRCodeImage(qrData)
      setLoading(false)
    }
  }, [activeChallenge, challengeSecret, challengeResponse, otpType])

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
            setChallengeResponse(state.response || '')
            console.log('✅ Restored challenge state for QR code')
            return true
          } else {
            console.log('🗑️ Challenge expired, cannot show QR code')
          }
        } catch (error) {
          console.error('Failed to restore challenge state:', error)
        }
      }
    }
    return false
  }

  // Generate QR code data for challenge-response (Google Authenticator compatible)
  const generateChallengeQRData = (challenge: any, secret: string, response: string) => {
    // Convert hex secret to base32 for Google Authenticator compatibility
    const base32Secret = hexToBase32(secret)
    
    // Create otpauth URI format that Google Authenticator understands
    const issuer = 'SecureAuth Pro'
    const accountName = `Challenge-${challenge.challenge}`
    
    // Use TOTP format with the secret, but include challenge info in the account name
    const otpauthUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${base32Secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA256&digits=6&period=30`
    
    return otpauthUri
  }

  // Convert hex string to base32 (required for Google Authenticator)
  const hexToBase32 = (hex: string): string => {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    
    // Convert hex to bytes
    const bytes: number[] = []
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16))
    }
    
    // Pad to 20 bytes (160 bits) for proper base32 encoding
    while (bytes.length < 20) {
      bytes.push(0)
    }
    
    let result = ''
    let buffer = 0
    let bitsLeft = 0
    
    for (const byte of bytes) {
      buffer = (buffer << 8) | byte
      bitsLeft += 8
      
      while (bitsLeft >= 5) {
        result += base32Chars[(buffer >> (bitsLeft - 5)) & 31]
        bitsLeft -= 5
      }
    }
    
    if (bitsLeft > 0) {
      result += base32Chars[(buffer << (5 - bitsLeft)) & 31]
    }
    
    return result
  }

  // Generate QR code image
  const generateQRCodeImage = async (data: string) => {
    try {
      const qrCodeDataURL = await QRCodeLib.toDataURL(data, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeImage(qrCodeDataURL)
    } catch (error) {
      console.error('Failed to generate QR code image:', error)
      setError('Failed to generate QR code image')
    }
  }

  const checkUserTypeAndFetchQR = async () => {
    try {
      // First check user's OTP type
      const userResponse = await fetch('/api/user/info')
      const userData = await userResponse.json()
      
      if (!userData.success) {
        router.push('/login')
        return
      }

      const userOtpType = userData.user.otpType
      setOtpType(userOtpType)

      if (userOtpType === 'challenge-response') {
        // Restore challenge from localStorage
        const restored = restoreChallengeState()
        if (!restored) {
          setError('No active challenge found. Please generate a challenge from the dashboard first.')
        } else {
          // Generate QR code data with challenge info will be handled by useEffect
        }
      } else {
        // For TOTP/HOTP users, use the regular QR code endpoint
        const response = await fetch('/api/qrcode')
        const data = await response.json()

        if (data.success) {
          setQrCode(data.qrCode)
        } else {
          if (data.message === 'Not authenticated' || data.message === 'Invalid token') {
            router.push('/login')
          } else {
            setError(data.message)
          }
        }
      }
    } catch (error) {
      setError('Failed to load QR code')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQRCode = () => {
    if (qrCodeImage) {
      const link = document.createElement('a')
      link.download = `challenge-qr-${activeChallenge?.challenge || 'code'}.png`
      link.href = qrCodeImage
      link.click()
    }
  }

  if (loading) {
    return <AdvancedLoading variant="spinner" text="Generating QR Code..." color="blue" />
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/50 rounded-full mb-4">
            <QrCode className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {otpType === 'challenge-response' ? 'Challenge QR Code' : 'Setup QR Code'}
          </h1>
          <p className="text-gray-400">
            {otpType === 'challenge-response' 
              ? 'Scan to get the current challenge on your authenticator'
              : 'Scan with your authenticator app to set up OTP'
            }
          </p>
        </div>

        {/* QR Code Card */}
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
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Error</p>
                <p className="text-sm text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {qrCode && otpType !== 'challenge-response' && (
            <div className="text-center">
              <div className="inline-block p-6 bg-white border-2 border-gray-700 rounded-xl mb-6">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>

              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-300 mb-1">Scan this QR code</p>
                    <p className="text-sm text-red-200">
                      Use Google Authenticator, Microsoft Authenticator, Authy, or any TOTP/HOTP compatible app
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div>✓ Google Authenticator</div>
                <div>✓ Microsoft Authenticator</div>
                <div>✓ Authy</div>
                <div>✓ LastPass</div>
              </div>
            </div>
          )}

          {otpType === 'challenge-response' && activeChallenge && (
            <div className="space-y-6">
              {/* QR Code Image */}
              {qrCodeImage && (
                <div className="text-center">
                  <div className="inline-block p-6 bg-white border-2 border-gray-700 rounded-xl mb-4">
                    <img
                      src={qrCodeImage}
                      alt="Challenge QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  
                  <div className="flex gap-3 justify-center mb-6">
                    <button
                      onClick={downloadQRCode}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download QR Code
                    </button>
                    <button
                      onClick={() => copyToClipboard(qrCode)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy Data
                    </button>
                  </div>
                </div>
              )}

              {/* Challenge Information */}
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-300 mb-4 text-center">Challenge Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-blue-400 font-medium">Challenge:</label>
                    <div className="mt-1 p-3 bg-gray-800 rounded-lg font-mono text-white text-center text-lg relative">
                      {activeChallenge.challenge}
                      <button
                        onClick={() => copyToClipboard(activeChallenge.challenge)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-blue-400 font-medium">Secret:</label>
                    <div className="mt-1 p-3 bg-gray-800 rounded-lg font-mono text-white text-center text-lg relative">
                      {challengeSecret || 'Not available'}
                      {challengeSecret && (
                        <button
                          onClick={() => copyToClipboard(challengeSecret)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-blue-400 font-medium">Combined String:</label>
                    <div className="mt-1 p-3 bg-purple-900/20 border border-purple-800 rounded-lg font-mono text-purple-300 text-center text-sm break-all relative">
                      {challengeSecret ? `${challengeSecret}:${activeChallenge.challenge}` : 'Generate secret first'}
                      {challengeSecret && (
                        <button
                          onClick={() => copyToClipboard(`${challengeSecret}:${activeChallenge.challenge}`)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-purple-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {challengeResponse && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-blue-400 font-medium">Response Code:</label>
                      <div className="mt-1 p-3 bg-orange-900/20 border border-orange-800 rounded-lg font-mono text-orange-400 text-center text-xl relative">
                        {challengeResponse}
                        <button
                          onClick={() => copyToClipboard(challengeResponse)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-orange-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <QrCode className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-green-300 mb-1">Google Authenticator Compatible</p>
                    <p className="text-sm text-green-200">
                      This QR code uses the standard otpauth:// format that works with Google Authenticator, 
                      Microsoft Authenticator, and other TOTP apps. The secret is derived from your challenge data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-yellow-300 mb-1">How to Use</p>
                    <p className="text-sm text-yellow-200">
                      1. Scan this QR code with Google Authenticator<br/>
                      2. It will show as "Challenge-{activeChallenge.challenge}"<br/>
                      3. The app will generate TOTP codes using your challenge secret<br/>
                      4. Use these codes for verification or comparison
                    </p>
                  </div>
                </div>
              </div>

              {/* Debug Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">otpauth URI:</h4>
                <div className="text-xs text-gray-400 font-mono break-all bg-gray-900 p-2 rounded">
                  {qrCode}
                </div>
              </div>
            </div>
          )}
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

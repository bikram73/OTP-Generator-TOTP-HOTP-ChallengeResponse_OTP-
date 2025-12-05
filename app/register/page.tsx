'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, User, Mail, Lock, AlertCircle, Check, Copy, Download, Clock } from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    otpType: 'totp' as 'totp' | 'hotp' | 'challenge-response',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setRegistrationData(data.userData)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (registrationData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
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
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/50 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Account Created</h2>
              <p className="text-gray-400">Save these credentials securely</p>
            </div>

            {/* Warning Alert */}
            <div className="mb-6 p-4 bg-orange-900/20 border border-orange-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-300">Important Security Notice</p>
                  <p className="text-sm text-orange-200 mt-1">
                    Your secret key and backup codes are shown only once. Save them in a secure location.
                  </p>
                </div>
              </div>
            </div>

            {/* Secret Key */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secret Key
              </label>
              <div className="relative">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm break-all text-white">
                  {registrationData.otpSecret}
                </div>
                <button
                  onClick={() => copyToClipboard(registrationData.otpSecret)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Backup Codes */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup Recovery Codes
              </label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  {registrationData.backupCodes.map((code: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded-md font-mono text-sm text-white"
                    >
                      <span>{code}</span>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <ShimmerButton
              href="/login"
              background="rgba(220, 38, 38, 1)"
              shimmerColor="#dc2626"
              shimmerDuration="3s"
              className="w-full block text-center"
            >
              Continue to Sign In
            </ShimmerButton>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">SecureAuth Pro</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-400">Get started with secure authentication</p>
        </div>

        {/* Registration Form */}
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
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Registration failed</p>
                <p className="text-sm text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  minLength={3}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-gray-500">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
                  placeholder="Create a strong password"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters with uppercase, lowercase, and a number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="otpType" className="block text-sm font-medium text-gray-300 mb-2">
                Authentication Method <span className="text-red-400">*</span>
              </label>
              <select
                id="otpType"
                value={formData.otpType}
                onChange={(e) => setFormData({ ...formData, otpType: e.target.value as 'totp' | 'hotp' | 'challenge-response' })}
                className="block w-full py-3 px-4 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
              >
                <option value="totp">TOTP (Time-based - Recommended)</option>
                <option value="hotp">HOTP (Counter-based)</option>
                <option value="challenge-response">Challenge-Response (Enterprise Security)</option>
              </select>
              
              {/* OTP Type Descriptions */}
              <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                {formData.otpType === 'totp' && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-400">
                      <span className="text-blue-400 font-medium">TOTP:</span> Codes refresh every 30 seconds. Works with Google Authenticator, Authy, and most mobile apps.
                    </div>
                  </div>
                )}
                {formData.otpType === 'hotp' && (
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-400">
                      <span className="text-purple-400 font-medium">HOTP:</span> Counter-based codes that don't expire automatically. Generate new codes manually.
                    </div>
                  </div>
                )}
                {formData.otpType === 'challenge-response' && (
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-400">
                      <span className="text-orange-400 font-medium">Challenge-Response:</span> Maximum security with server-generated challenges. Perfect for high-value transactions and enterprise use.
                    </div>
                  </div>
                )}
              </div>
            </div>

              <ShimmerButton
                type="submit"
                disabled={loading}
                background="rgba(220, 38, 38, 1)"
                shimmerColor="#dc2626"
                shimmerDuration="3s"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" variant="default" />
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </ShimmerButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-red-400 hover:text-red-300">
                Sign in
              </Link>
            </p>
          </div>
            </div>
          </MagicCard>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

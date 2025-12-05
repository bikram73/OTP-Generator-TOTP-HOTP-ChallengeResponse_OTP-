'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, ArrowLeft, Clock, Hash, User, Mail, Lock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'
import { ShineBorder } from '@/components/ui/shine-border'
import AdvancedLoading from '@/components/ui/advanced-loading'

interface UserInfo {
  username: string
  email?: string
  otpType: 'totp' | 'hotp'
  counter?: number
  createdAt: number
  locked: boolean
  backupCodesCount: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/info')
      const data = await response.json()

      if (data.success) {
        setUserInfo(data.user)
      } else {
        if (data.message === 'Not authenticated') {
          router.push('/login')
        } else {
          setError(data.message)
        }
      }
    } catch (error) {
      setError('Failed to load user information')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return <AdvancedLoading variant="pulse" text="Loading Settings..." color="purple" />
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your account information and OTP preferences</p>
        </div>

        {userInfo && (
          <div className="space-y-6">
            {/* User Information Card */}
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
                    <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Account Information</h2>
                      <p className="text-sm text-gray-400">Your account details and profile</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-400">Username</div>
                          <div className="font-medium text-white">{userInfo.username}</div>
                        </div>
                      </div>
                    </div>

                    {userInfo.email && (
                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-400">Email</div>
                            <div className="font-medium text-white">{userInfo.email}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-400">Account Created</div>
                          <div className="font-medium text-white">{formatDate(userInfo.createdAt)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-3">
                        {userInfo.locked ? (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                        <div>
                          <div className="text-sm text-gray-400">Account Status</div>
                          <div className={`font-medium ${userInfo.locked ? 'text-red-400' : 'text-green-400'}`}>
                            {userInfo.locked ? 'Locked' : 'Active'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>

            {/* OTP Configuration Card */}
            <div className="relative">
              <ShineBorder
                className="p-8 rounded-xl"
                shineColor={userInfo.otpType === 'totp' ? ["#3b82f6", "#1d4ed8"] : ["#8b5cf6", "#7c3aed"]}
                duration={14}
                borderWidth={1}
              >
                <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 ${userInfo.otpType === 'totp' ? 'bg-blue-900/50' : 'bg-purple-900/50'} rounded-lg flex items-center justify-center`}>
                      {userInfo.otpType === 'totp' ? (
                        <Clock className="w-6 h-6 text-blue-400" />
                      ) : (
                        <Hash className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">OTP Configuration</h2>
                      <p className="text-sm text-gray-400">Your current authentication method</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-6 bg-gradient-to-br ${userInfo.otpType === 'totp' ? 'from-blue-900/30 to-blue-800/20 border-blue-800' : 'from-purple-900/30 to-purple-800/20 border-purple-800'} border rounded-xl`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm font-medium text-gray-300 mb-1">OTP Type</div>
                          <div className="text-2xl font-bold text-white">
                            {userInfo.otpType.toUpperCase()}
                          </div>
                        </div>
                        {userInfo.otpType === 'totp' ? (
                          <div className="w-16 h-16 bg-blue-900/50 rounded-xl flex items-center justify-center">
                            <Clock className="w-8 h-8 text-blue-400" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-purple-900/50 rounded-xl flex items-center justify-center">
                            <Hash className="w-8 h-8 text-purple-400" />
                          </div>
                        )}
                      </div>

                      <div className={`mt-4 pt-4 border-t ${userInfo.otpType === 'totp' ? 'border-blue-700' : 'border-purple-700'}`}>
                        <div className="text-sm text-gray-300">
                          {userInfo.otpType === 'totp' ? (
                            <>
                              <strong className="text-blue-300">Time-based One-Time Password (TOTP)</strong>
                              <p className="mt-2 text-gray-400">
                                Your OTP codes automatically refresh every 30 seconds based on the current time. 
                                Codes are synchronized with UTC time and are valid for the current time window.
                              </p>
                            </>
                          ) : (
                            <>
                              <strong className="text-purple-300">HMAC-based One-Time Password (HOTP)</strong>
                              <p className="mt-2 text-gray-400">
                                Your OTP codes are generated based on a counter. Each code is generated 
                                when you request it, and the counter increments automatically.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {userInfo.otpType === 'hotp' && userInfo.counter !== undefined && (
                      <div className="p-4 bg-purple-900/20 border border-purple-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Hash className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-sm text-gray-400">Current Counter</div>
                            <div className="text-lg font-semibold text-white">{userInfo.counter}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ShineBorder>
            </div>

            {/* Security Information Card */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Security Information</h2>
                  <p className="text-sm text-gray-400">Your account security details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-300 mb-1">Backup Codes</div>
                      <div className="text-lg font-bold text-white">
                        {userInfo.backupCodesCount} available
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-3">
                    Backup codes can be used to access your account if you lose access to your authenticator app.
                    Keep them safe and use them only when necessary.
                  </p>
                </div>

                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-300 mb-1">Security Status</div>
                      <p className="text-sm text-green-200">
                        Your account is protected with {userInfo.otpType.toUpperCase()} two-factor authentication. 
                        All OTP secrets are encrypted and securely stored.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && userInfo && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


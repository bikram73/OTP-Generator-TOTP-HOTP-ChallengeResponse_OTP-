'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, Clock, Hash, ArrowRight, CheckCircle2, Lock, RefreshCw, Copy, Info } from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { ShineBorder } from '@/components/ui/shine-border'
import { DotPattern } from '@/components/ui/dot-pattern'

export default function AboutPage() {
  const [totpCode, setTotpCode] = useState('------')
  const [hotpCode, setHotpCode] = useState('------')
  const [totpRemaining, setTotpRemaining] = useState(30)
  const [hotpCounter, setHotpCounter] = useState(0)
  const [totpLoading, setTotpLoading] = useState(true)
  const [hotpLoading, setHotpLoading] = useState(true)
  const [challengeCode, setChallengeCode] = useState('A1B2C3D4')
  const [responseCode, setResponseCode] = useState('847291')
  const [challengeExpiry, setChallengeExpiry] = useState(300) // 5 minutes in seconds

  // Simulate TOTP generation
  useEffect(() => {
    const generateTOTP = () => {
      // Simulate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setTotpCode(code)
      setTotpRemaining(30)
      setTotpLoading(false)
    }

    generateTOTP()

    const interval = setInterval(() => {
      setTotpRemaining((prev) => {
        if (prev <= 1) {
          generateTOTP()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Simulate HOTP generation
  useEffect(() => {
    const generateHOTP = () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setHotpCode(code)
      setHotpCounter((prev) => prev + 1)
      setHotpLoading(false)
    }

    generateHOTP()
  }, [])

  const generateNewHOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setHotpCode(code)
    setHotpCounter((prev) => prev + 1)
  }

  const generateNewChallenge = () => {
    // Generate random challenge (8 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let challenge = ''
    for (let i = 0; i < 8; i++) {
      challenge += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setChallengeCode(challenge)
    
    // Generate corresponding response (6 digits)
    const response = Math.floor(100000 + Math.random() * 900000).toString()
    setResponseCode(response)
    
    // Reset expiry to 5 minutes
    setChallengeExpiry(300)
  }

  // Challenge-Response countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setChallengeExpiry((prev) => {
        if (prev <= 1) {
          generateNewChallenge()
          return 300
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <DotPattern className="opacity-30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]" />
      
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">SecureAuth Pro</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/challenge-guide"
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Challenge Guide
              </Link>
              <ShimmerButton
                href="/register"
                background="rgba(220, 38, 38, 1)"
                shimmerColor="#dc2626"
                shimmerDuration="3s"
                className="px-4 py-2 text-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </ShimmerButton>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Understanding OTP
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Learn about Time-based (TOTP), Counter-based (HOTP), and advanced Challenge-Response authentication protocols
          </p>
        </div>

        {/* Live Demos Section */}
        <section className="mb-24 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Live Demonstration</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* TOTP Live Demo */}
            <div className="relative">
              <MagicCard
                className="p-8"
                gradientSize={350}
                gradientFrom="#3b82f6"
                gradientTo="#6366f1"
                gradientColor="#1e293b"
                gradientOpacity={0.15}
              >
                <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">TOTP - Live Demo</h3>
                      <p className="text-sm text-gray-400">Time-based One-Time Password</p>
                    </div>
                  </div>

                  <div className="text-center py-6 bg-gray-800 rounded-xl mb-4">
                    <div className="text-5xl font-mono font-bold text-white mb-4 tracking-wider">
                      {totpLoading ? '------' : totpCode}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-2xl font-semibold text-white">{totpRemaining}s</span>
                      <span className="text-gray-400">remaining</span>
                    </div>
                    <div className="w-full max-w-xs mx-auto h-2 bg-gray-700 rounded-full overflow-hidden mt-4">
                      <div
                        className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${(totpRemaining / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-300">
                        <p className="font-medium mb-1">How it works:</p>
                        <p className="text-blue-200">
                          This code automatically refreshes every 30 seconds based on the current time. 
                          The code is synchronized with UTC time and is valid for the current 30-second window.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>

            {/* HOTP Live Demo */}
            <div className="relative">
              <MagicCard
                className="p-8"
                gradientSize={350}
                gradientFrom="#6366f1"
                gradientTo="#8b5cf6"
                gradientColor="#1e293b"
                gradientOpacity={0.15}
              >
                <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center">
                      <Hash className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">HOTP - Live Demo</h3>
                      <p className="text-sm text-gray-400">Counter-based One-Time Password</p>
                    </div>
                  </div>

                  <div className="text-center py-6 bg-gray-800 rounded-xl mb-4">
                    <div className="text-5xl font-mono font-bold text-white mb-4 tracking-wider">
                      {hotpLoading ? '------' : hotpCode}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-300 mb-4">
                      <Hash className="w-5 h-5" />
                      <span className="text-lg">Counter: <span className="font-semibold text-white">{hotpCounter}</span></span>
                    </div>
                    <button
                      onClick={generateNewHOTP}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto text-sm font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Generate Next Code
                    </button>
                  </div>

                  <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-indigo-300">
                        <p className="font-medium mb-1">How it works:</p>
                        <p className="text-indigo-200">
                          This code doesn't expire automatically. It's generated based on a counter that increments each time you generate a new code. 
                          Click "Generate Next Code" to see the counter increase.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>

            {/* Challenge-Response Live Demo */}
            <div className="relative">
              <MagicCard
                className="p-8"
                gradientSize={350}
                gradientFrom="#ea580c"
                gradientTo="#dc2626"
                gradientColor="#7f1d1d"
                gradientOpacity={0.2}
              >
                <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-900/50 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Challenge-Response - Live Demo</h3>
                      <p className="text-sm text-gray-400">Server-generated Challenge Authentication</p>
                    </div>
                  </div>

                  <div className="text-center py-6 bg-gray-800 rounded-xl mb-4">
                    <div className="text-2xl font-mono font-bold text-white mb-4 tracking-wider">
                      Challenge: {challengeCode}
                    </div>
                    <div className="text-2xl font-mono font-bold text-orange-400 mb-4 tracking-wider">
                      Response: {responseCode}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
                      <Clock className="w-5 h-5" />
                      <span className="text-lg">Expires in: <span className="font-semibold text-white">{formatTime(challengeExpiry)}</span></span>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={generateNewChallenge}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        <RefreshCw className="w-4 h-4" />
                        New Challenge
                      </button>
                      <Link
                        href="/challenge"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors text-sm font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        Try Live
                      </Link>
                    </div>
                  </div>

                  <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-orange-300">
                        <p className="font-medium mb-1">How it works:</p>
                        <p className="text-orange-200">
                          Server generates a unique challenge. Your authenticator combines it with your secret to create a response. 
                          Each challenge is single-use and expires in 5 minutes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="mb-24 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">OTP Methods: Key Differences</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* TOTP Details */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <ShineBorder
                shineColor={["#3b82f6", "#6366f1"]}
                duration={14}
                borderWidth={1}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-blue-900/50 rounded-xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">TOTP</h3>
                    <p className="text-sm text-gray-400">Time-based One-Time Password</p>
                    <p className="text-xs text-gray-500 mt-1">RFC 6238 Standard</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Time-Based</h4>
                    <p className="text-gray-300 text-sm">
                      Codes are generated based on the current time (usually 30-second windows). 
                      The same code is valid for the entire time window.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Automatic Expiration</h4>
                    <p className="text-gray-300 text-sm">
                      Codes automatically expire after 30 seconds and a new code is generated. 
                      This provides better security as codes can't be reused after expiration.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Best For</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>User login authentication</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Two-factor authentication (2FA)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Mobile authenticator apps (Google Authenticator, Authy)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Daily user authentication</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-300">
                      <strong>Example:</strong> When you log into your email with Google Authenticator, 
                      the code refreshes every 30 seconds automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* HOTP Details */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <ShineBorder
                shineColor={["#6366f1", "#8b5cf6"]}
                duration={14}
                borderWidth={1}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-indigo-900/50 rounded-xl flex items-center justify-center">
                    <Hash className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">HOTP</h3>
                    <p className="text-sm text-gray-400">HMAC-based One-Time Password</p>
                    <p className="text-xs text-gray-500 mt-1">RFC 4226 Standard</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Counter-Based</h4>
                    <p className="text-gray-300 text-sm">
                      Codes are generated based on an incrementing counter value. 
                      Each code is tied to a specific counter number.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Manual Generation</h4>
                    <p className="text-gray-300 text-sm">
                      Codes don't expire automatically. A new code is only generated when you manually request it, 
                      which increments the counter. Codes remain valid until used.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Best For</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>API authentication tokens</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Event-driven authentication</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>One-time access tokens</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Transaction verification</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-4">
                    <p className="text-sm text-indigo-300">
                      <strong>Example:</strong> When making a bank transfer, you receive a one-time code via SMS. 
                      This code is only valid for that specific transaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Challenge-Response Details */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <ShineBorder
                shineColor={["#ea580c", "#dc2626"]}
                duration={14}
                borderWidth={1}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-orange-900/50 rounded-xl flex items-center justify-center">
                    <Shield className="w-7 h-7 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Challenge-Response</h3>
                    <p className="text-sm text-gray-400">Server-generated Challenge Authentication</p>
                    <p className="text-xs text-gray-500 mt-1">Enterprise Security Standard</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Challenge-Based</h4>
                    <p className="text-gray-300 text-sm">
                      Server generates unique challenges (random data or transaction details). 
                      Each authentication uses a different challenge value.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Dynamic Response</h4>
                    <p className="text-gray-300 text-sm">
                      User's device combines the challenge with a shared secret to generate a unique response. 
                      Each challenge produces a different response, even with the same secret.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Best For</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>High-value financial transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Enterprise security systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Transaction-specific authentication</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Maximum security applications</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4">
                    <p className="text-sm text-orange-300">
                      <strong>Example:</strong> When authorizing a $10,000 wire transfer, the bank sends challenge "TX-2024-A1B2C3". 
                      Your device generates response "847291" specific to this transaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Comparison Table */}
        <section className="mb-24 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Technical Comparison</h2>

          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">TOTP</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">HOTP</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Challenge-Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-white">Base Standard</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">RFC 6238</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">RFC 4226</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Enterprise Custom</td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-white">Code Expiration</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    <span className="inline-flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      30 seconds
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    <span className="text-gray-500">No expiration</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    <span className="inline-flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      5 minutes
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-white">Synchronization</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Time-based (UTC)</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Counter-based</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Challenge-based</td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-white">Code Refresh</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Automatic</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Manual</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Server-initiated</td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-white">Replay Protection</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    <span className="text-green-400">Time window validation</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    <span className="text-green-400">Counter increment required</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    <span className="text-green-400">Unique challenge per use</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-white">Clock Drift Tolerance</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">±30 seconds</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Not applicable</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Not applicable</td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-white">Mobile App Support</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    <span className="text-green-400">Widely supported</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    <span className="text-gray-500">Limited support</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    <span className="text-green-400">Enterprise apps</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-white">Use Case</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">Login authentication</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">API/Transaction auth</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">High-value transactions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-24 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* TOTP Process */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">TOTP Generation Process</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Shared Secret</h4>
                    <p className="text-sm text-gray-300">
                      A secret key is shared between the server and your device during initial setup (usually via QR code).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Time Calculation</h4>
                    <p className="text-sm text-gray-300">
                      The current time is divided by the time step (30 seconds) to get a time counter.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">HMAC Generation</h4>
                    <p className="text-sm text-gray-300">
                      HMAC-SHA1 algorithm combines the secret key with the time counter to generate a hash.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Code Extraction</h4>
                    <p className="text-sm text-gray-300">
                      The hash is processed to extract a 6-digit code that's valid for the current 30-second window.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* HOTP Process */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center">
                  <Hash className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">HOTP Generation Process</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Shared Secret</h4>
                    <p className="text-sm text-gray-300">
                      A secret key is shared between the server and your device, similar to TOTP.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Counter Value</h4>
                    <p className="text-sm text-gray-300">
                      Both sides maintain a synchronized counter that starts at 0 and increments with each code generation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">HMAC Generation</h4>
                    <p className="text-sm text-gray-300">
                      HMAC-SHA1 algorithm combines the secret key with the current counter value to generate a hash.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Code Extraction</h4>
                    <p className="text-sm text-gray-300">
                      The hash is processed to extract a 6-digit code. The counter increments for the next code.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Challenge-Response Process */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-900/50 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Challenge-Response Process</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Challenge Generation</h4>
                    <p className="text-sm text-gray-300">
                      Server generates a unique challenge containing random data or transaction-specific information.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Challenge Delivery</h4>
                    <p className="text-sm text-gray-300">
                      The challenge is sent to the user's authenticator device through a secure channel.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Response Calculation</h4>
                    <p className="text-sm text-gray-300">
                      User's device combines the challenge with the shared secret using HMAC to generate a response.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Response Verification</h4>
                    <p className="text-sm text-gray-300">
                      Server performs the same calculation and verifies the response matches the expected value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="mb-24 relative z-10">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Security Features</h2>
              <p className="text-gray-300 mb-8 text-center text-lg">
                All three protocols use industry-standard cryptography to ensure secure authentication
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Lock, title: 'HMAC-SHA1/SHA256', desc: 'Cryptographically secure hashing algorithms' },
                  { icon: Shield, title: 'Shared Secret', desc: 'Encrypted secret key storage' },
                  { icon: Clock, title: 'Time/Counter/Challenge Sync', desc: 'Prevents replay attacks' },
                  { icon: CheckCircle2, title: 'One-Time Use', desc: 'Codes cannot be reused' },
                  { icon: Lock, title: 'Offline Capable', desc: 'TOTP/HOTP work without internet' },
                  { icon: Shield, title: 'RFC Compliant', desc: 'Follows international standards' },
                  { icon: Shield, title: 'Dynamic Challenges', desc: 'Unique challenge per transaction' },
                  { icon: Lock, title: 'Transaction Binding', desc: 'Challenge includes transaction data' },
                  { icon: CheckCircle2, title: 'Enterprise Grade', desc: 'Maximum security for high-value operations' },
                ].map((feature, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <feature.icon className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-300">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center relative z-10">
          <div className="bg-gray-50 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Create your account and start using secure OTP authentication today
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <ShimmerButton
                href="/register"
                background="rgba(17, 24, 39, 1)"
                shimmerColor="#3b82f6"
                shimmerDuration="3s"
                className="px-8 py-3"
              >
                Create Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </ShimmerButton>
              <Link
                href="/login"
                className="bg-white text-gray-900 px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


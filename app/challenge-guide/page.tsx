'use client'

import Link from 'next/link'
import { Shield, ArrowLeft, CheckCircle2, AlertTriangle, Clock, Lock, RefreshCw, QrCode, Copy, Smartphone } from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { DotPattern } from '@/components/ui/dot-pattern'

export default function ChallengeGuidePage() {
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
                href="/about"
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/challenge"
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Try Challenge-Response
              </Link>
              <ShimmerButton
                href="/register"
                background="rgba(220, 38, 38, 1)"
                shimmerColor="#dc2626"
                shimmerDuration="3s"
                className="px-4 py-2 text-sm"
              >
                Get Started
              </ShimmerButton>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Challenge-Response OTP Guide
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Complete guide to using Challenge-Response authentication in SecureAuth Pro
          </p>
        </div>

        {/* Overview */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-2xl p-8 border border-orange-800/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-900/50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">What is Challenge-Response OTP?</h2>
                <p className="text-gray-400">The most secure authentication method</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Challenge-Response OTP is the most secure authentication method in SecureAuth Pro. Unlike TOTP (time-based) 
              and HOTP (counter-based), it uses server-generated unique challenges for each authentication attempt, 
              providing maximum security for high-value transactions and sensitive operations.
            </p>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">🚀 Getting Started</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Registration */}
            <div className="relative">
              <MagicCard
                className="p-8"
                gradientSize={350}
                gradientFrom="#3b82f6"
                gradientTo="#1d4ed8"
                gradientColor="#1e40af"
                gradientOpacity={0.2}
              >
                <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">1. User Registration</h3>
                      <p className="text-sm text-gray-400">Set up your account</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="text-white font-medium">Go to Registration</p>
                        <p className="text-gray-400 text-sm">Visit <code className="bg-gray-800 px-2 py-1 rounded">/register</code></p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="text-white font-medium">Select OTP Type</p>
                        <p className="text-gray-400 text-sm">Choose "Challenge-Response (Enterprise Security)"</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="text-white font-medium">Complete Registration</p>
                        <p className="text-gray-400 text-sm">Fill in username, email, and password</p>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>

            {/* Initial Setup */}
            <div className="relative">
              <MagicCard
                className="p-8"
                gradientSize={350}
                gradientFrom="#10b981"
                gradientTo="#059669"
                gradientColor="#065f46"
                gradientOpacity={0.2}
              >
                <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">2. Initial Setup</h3>
                      <p className="text-sm text-gray-400">Automatic initialization</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <p className="text-gray-300">Unique shared secret key</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <p className="text-gray-300">Empty challenge history</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <p className="text-gray-300">Ready-to-use challenge generation</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                    <p className="text-sm text-green-300">
                      <strong>Note:</strong> After registration, you're automatically initialized for Challenge-Response authentication.
                    </p>
                  </div>
                </div>
              </MagicCard>
            </div>
          </div>
        </section>

        {/* Using the System */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">📱 Using the Challenge-Response System</h2>
          
          <div className="space-y-8">
            {/* Step 1 */}
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
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-orange-900/50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-orange-400">1</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Access the Challenge Page</h3>
                      <p className="text-gray-400">Start your authentication process</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-orange-400" />
                      </div>
                      <p className="text-white font-medium">Direct URL</p>
                      <p className="text-gray-400 text-sm"><code>/challenge</code></p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <ArrowLeft className="w-6 h-6 text-orange-400" />
                      </div>
                      <p className="text-white font-medium">From Dashboard</p>
                      <p className="text-gray-400 text-sm">"Try Challenge-Response" button</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-orange-400" />
                      </div>
                      <p className="text-white font-medium">About Page</p>
                      <p className="text-gray-400 text-sm">Demo section link</p>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <MagicCard
                className="p-8"
                gradientSize={400}
                gradientFrom="#7c3aed"
                gradientTo="#5b21b6"
                gradientColor="#4c1d95"
                gradientOpacity={0.2}
              >
                <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-purple-900/50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-purple-400">2</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Generate a Challenge</h3>
                      <p className="text-gray-400">Server creates unique authentication challenge</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">What happens:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <p className="text-gray-300">Unique challenge ID generated</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <p className="text-gray-300">Random 8-character hex challenge code</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <p className="text-gray-300">5-minute expiration timer</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <p className="text-gray-300">Optional context (transaction details)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Example Challenge:</h4>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <p className="text-sm text-gray-400 mb-2">Challenge Code:</p>
                        <p className="font-mono text-white text-sm break-all">A1B2C3D4</p>
                        <p className="text-sm text-gray-400 mt-3 mb-1">Context:</p>
                        <p className="text-sm text-purple-300">Wire Transfer $10,000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <MagicCard
                className="p-8"
                gradientSize={400}
                gradientFrom="#0891b2"
                gradientTo="#0e7490"
                gradientColor="#164e63"
                gradientOpacity={0.2}
              >
                <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-cyan-900/50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-cyan-400">3</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Get the Challenge Code</h3>
                      <p className="text-gray-400">Multiple ways to access your challenge</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Copy className="w-6 h-6 text-cyan-400" />
                        <h4 className="text-lg font-semibold text-white">Option A: Manual Entry</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <p className="text-gray-300">Challenge code displayed on screen</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <p className="text-gray-300">Copy button for easy copying</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <p className="text-gray-300">8-character hexadecimal format</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <QrCode className="w-6 h-6 text-cyan-400" />
                        <h4 className="text-lg font-semibold text-white">Option B: QR Code Scanning</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <p className="text-gray-300">QR code generated automatically</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <p className="text-gray-300">Scan with compatible authenticator app</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <p className="text-gray-300">Contains challenge data + metadata</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <MagicCard
                className="p-8"
                gradientSize={400}
                gradientFrom="#059669"
                gradientTo="#047857"
                gradientColor="#064e3b"
                gradientOpacity={0.2}
              >
                <div className="bg-gray-900 rounded-xl p-8 relative z-10 border border-gray-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-green-900/50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-400">4</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Generate Response</h3>
                      <p className="text-gray-400">Use your authenticator device/app</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Smartphone className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-white font-medium mb-2">Input Challenge</p>
                      <p className="text-gray-400 text-sm">Enter the challenge code into your authenticator</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-white font-medium mb-2">Calculate Response</p>
                      <p className="text-gray-400 text-sm">Authenticator uses shared secret + challenge + HMAC-SHA256</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-white font-medium mb-2">Get 6-Digit Code</p>
                      <p className="text-gray-400 text-sm">Receive your unique response code</p>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>

            {/* Step 5 */}
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
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-red-900/50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-red-400">5</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Verify Response</h3>
                      <p className="text-gray-400">Complete the authentication process</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Verification Process:</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                            1
                          </div>
                          <p className="text-gray-300">Enter 6-digit response in verification field</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                            2
                          </div>
                          <p className="text-gray-300">Click "Verify Response" button</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                            3
                          </div>
                          <p className="text-gray-300">System validates and grants access</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">System Validates:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <p className="text-gray-300">Challenge hasn't expired (5-minute window)</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <RefreshCw className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <p className="text-gray-300">Challenge hasn't been used before</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <p className="text-gray-300">Response matches expected calculation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">🔐 Security Features</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">Challenge Properties</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Unique per request</p>
                    <p className="text-gray-400 text-sm">Each challenge is cryptographically random</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Time-limited</p>
                    <p className="text-gray-400 text-sm">5-minute expiration window</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Single-use</p>
                    <p className="text-gray-400 text-sm">Cannot be reused after verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Context-aware</p>
                    <p className="text-gray-400 text-sm">Can include transaction-specific data</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">Security Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">No replay attacks</p>
                    <p className="text-gray-400 text-sm">Each challenge is unique</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Transaction binding</p>
                    <p className="text-gray-400 text-sm">Challenge can include transaction details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Server control</p>
                    <p className="text-gray-400 text-sm">Server initiates each authentication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Maximum security</p>
                    <p className="text-gray-400 text-sm">Ideal for high-value operations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">💡 Use Cases</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-800/30">
              <div className="w-12 h-12 bg-yellow-900/50 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">High-Value Transactions</h3>
              <p className="text-gray-400 text-sm mb-4">
                Perfect for wire transfers, large purchases, and financial operations requiring maximum security.
              </p>
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-300 font-mono">
                  generateChallenge('Wire Transfer $50,000')
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-6 border border-purple-800/30">
              <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Administrative Actions</h3>
              <p className="text-gray-400 text-sm mb-4">
                Secure sensitive operations like user management, system configuration, and data access.
              </p>
              <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3">
                <p className="text-xs text-purple-300 font-mono">
                  generateChallenge('Delete User Account')
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-800/30">
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">API Authentication</h3>
              <p className="text-gray-400 text-sm mb-4">
                Secure API access for critical operations, data exports, and system integrations.
              </p>
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-300 font-mono">
                  generateChallenge('API: Financial Data')
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-2xl p-12 border border-red-800/30">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience enterprise-grade security with Challenge-Response OTP authentication
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ShimmerButton
                href="/register"
                background="rgba(220, 38, 38, 1)"
                shimmerColor="#dc2626"
                shimmerDuration="3s"
                className="px-8 py-3"
              >
                Create Account
              </ShimmerButton>
              
              <Link
                href="/challenge"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <Shield className="w-4 h-4" />
                Try Challenge-Response
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
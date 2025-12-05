import Link from 'next/link'
import { Shield, Clock, Lock, ArrowRight, Check } from 'lucide-react'
import { DotPattern } from '@/components/ui/dot-pattern'
import { ShineBorder } from '@/components/ui/shine-border'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { TextAnimate } from '@/components/ui/text-animate'

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <DotPattern className="opacity-30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]" />
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">SecureAuth Pro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/about"
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/challenge-guide"
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Challenge Guide
              </Link>
              <Link
                href="/login"
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Sign in
              </Link>
              <ShimmerButton
                href="/register"
                background="rgba(220, 38, 38, 1)"
                shimmerColor="#dc2626"
                shimmerDuration="3s"
                className="px-4 py-2 text-sm"
              >
                Get started
                <ArrowRight className="w-4 h-4 ml-2" />
              </ShimmerButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Advanced Authentication
            <span className="block mt-2">
              <span className="text-gray-400">with </span>
              <TypingAnimation
                words={['OTP', 'TOTP', 'HOTP', 'Challenge-Response']}
                className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-700"
                typeSpeed={150}
                deleteSpeed={75}
                pauseDelay={2000}
                loop={true}
                startOnView={true}
                showCursor={true}
                blinkCursor={true}
                cursorStyle="line"
                as="span"
              />
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Professional multi-factor authentication system supporting TOTP, HOTP, and advanced Challenge-Response protocols.
            Enterprise-grade security for your applications.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <ShimmerButton
              href="/register"
              background="rgba(220, 38, 38, 1)"
              shimmerColor="#dc2626"
              shimmerDuration="3s"
              className="px-8 py-3"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </ShimmerButton>
            <Link
              href="/login"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors font-medium shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <TextAnimate
              as="h2"
              className="text-3xl font-bold text-white mb-4"
              by="word"
              animation="blurInUp"
              startOnView={true}
              once={true}
              delay={0}
              duration={0.5}
            >
              Secure by Design
            </TextAnimate>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Industry-standard authentication protocols with modern security features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* TOTP Card */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-2xl hover:shadow-blue-500/10 transition-shadow overflow-hidden">
              <ShineBorder
                shineColor={["#3b82f6", "#1d4ed8"]}
                duration={14}
                borderWidth={1}
              />
              <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">TOTP</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Time-based One-Time Password (RFC 6238). Codes expire every 30 seconds for enhanced security.
              </p>
              <ul className="space-y-2">
                {['30-second validity windows', 'Automatic code refresh', 'Mobile app compatible'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              </div>
            </div>

            {/* HOTP Card */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-2xl hover:shadow-purple-500/10 transition-shadow overflow-hidden">
              <ShineBorder
                shineColor={["#8b5cf6", "#7c3aed"]}
                duration={14}
                borderWidth={1}
              />
              <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">HOTP</h3>
              </div>
              <p className="text-gray-400 mb-6">
                HMAC-based One-Time Password (RFC 4226). Counter-based generation for event-driven authentication.
              </p>
              <ul className="space-y-2">
                {['Counter-based generation', 'One-time use per code', 'Perfect for API access'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              </div>
            </div>

            {/* Challenge-Response Card */}
            <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-2xl hover:shadow-orange-500/10 transition-shadow overflow-hidden">
              <ShineBorder
                shineColor={["#ea580c", "#dc2626"]}
                duration={14}
                borderWidth={1}
              />
              <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-900/50 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Challenge-Response</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Advanced server-generated challenges with unique responses. Maximum security for high-value transactions.
              </p>
              <ul className="space-y-2">
                {['Server-generated challenges', 'Transaction-specific codes', 'Enterprise security'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-red-900/20 to-gray-900 rounded-2xl p-12 text-white border border-red-900/30">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4 text-white">Enterprise-Grade Security</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Built with security best practices and industry standards
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  'AES-256 encryption for secrets',
                  'bcrypt password hashing',
                  'JWT-based authentication',
                  'Rate limiting protection',
                  'Backup recovery codes',
                  'RFC 6238 & 4226 compliant'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>© 2025 OTP Generator. Professional authentication system.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

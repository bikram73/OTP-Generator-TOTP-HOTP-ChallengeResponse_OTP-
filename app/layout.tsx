import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'SecureAuth Pro - Advanced OTP Authentication',
  description: 'Professional TOTP and HOTP authentication system with enterprise-grade security and modern dark interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased bg-black text-white min-h-screen" suppressHydrationWarning={true}>
        <div className="bg-gradient-dark min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}


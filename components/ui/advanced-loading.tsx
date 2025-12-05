'use client'

import { cn } from '@/lib/utils'
import { Shield } from 'lucide-react'

interface AdvancedLoadingProps {
  variant?: 'spinner' | 'pulse' | 'bars' | 'dots' | 'brand'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'default' | 'red' | 'blue' | 'green' | 'purple' | 'orange'
  text?: string
  fullScreen?: boolean
}

export function AdvancedLoading({
  variant = 'brand',
  size = 'lg',
  color = 'red',
  text = 'Loading...',
  fullScreen = true
}: AdvancedLoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const colorClasses = {
    default: {
      primary: 'text-white',
      secondary: 'text-gray-400',
      accent: 'bg-white',
      border: 'border-gray-600'
    },
    red: {
      primary: 'text-red-400',
      secondary: 'text-red-300',
      accent: 'bg-red-400',
      border: 'border-red-600'
    },
    blue: {
      primary: 'text-blue-400',
      secondary: 'text-blue-300',
      accent: 'bg-blue-400',
      border: 'border-blue-600'
    },
    green: {
      primary: 'text-green-400',
      secondary: 'text-green-300',
      accent: 'bg-green-400',
      border: 'border-green-600'
    },
    purple: {
      primary: 'text-purple-400',
      secondary: 'text-purple-300',
      accent: 'bg-purple-400',
      border: 'border-purple-600'
    },
    orange: {
      primary: 'text-orange-400',
      secondary: 'text-orange-300',
      accent: 'bg-orange-400',
      border: 'border-orange-600'
    }
  }

  const colors = colorClasses[color]

  const SpinnerAnimation = () => (
    <div className="relative">
      <div className={cn(
        'animate-spin rounded-full border-2 border-transparent',
        sizeClasses[size],
        colors.border,
        colors.primary
      )}>
        <div className={cn('absolute inset-0 rounded-full border-2 border-t-transparent', colors.border)} />
      </div>
      <div className={cn(
        'absolute inset-2 rounded-full animate-pulse opacity-20',
        colors.accent
      )} />
    </div>
  )

  const PulseAnimation = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            size === 'sm' ? 'w-2 h-2' : 
            size === 'md' ? 'w-3 h-3' :
            size === 'lg' ? 'w-4 h-4' : 'w-6 h-6',
            colors.accent
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )

  const BarsAnimation = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse',
            colors.accent,
            size === 'sm' ? 'w-1' : 
            size === 'md' ? 'w-1.5' :
            size === 'lg' ? 'w-2' : 'w-3'
          )}
          style={{
            height: `${20 + (i % 3) * 10}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  )

  const DotsAnimation = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            size === 'sm' ? 'w-2 h-2' : 
            size === 'md' ? 'w-3 h-3' :
            size === 'lg' ? 'w-4 h-4' : 'w-6 h-6',
            colors.accent
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  )

  const BrandAnimation = () => (
    <div className="relative">
      {/* Outer rotating ring */}
      <div className={cn(
        'animate-spin rounded-full border-2 border-transparent',
        sizeClasses[size],
        `border-t-red-400 border-r-red-600`
      )} style={{ animationDuration: '2s' }} />
      
      {/* Inner counter-rotating ring */}
      <div className={cn(
        'absolute inset-2 animate-spin rounded-full border-2 border-transparent',
        `border-b-red-400 border-l-red-600`
      )} style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      
      {/* Center logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center animate-pulse">
          <Shield className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  )

  const renderAnimation = () => {
    switch (variant) {
      case 'spinner':
        return <SpinnerAnimation />
      case 'pulse':
        return <PulseAnimation />
      case 'bars':
        return <BarsAnimation />
      case 'dots':
        return <DotsAnimation />
      case 'brand':
        return <BrandAnimation />
      default:
        return <SpinnerAnimation />
    }
  }

  const content = (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        {renderAnimation()}
      </div>
      
      {text && (
        <div className="space-y-2">
          <p className={cn('text-lg font-medium', colors.primary)}>
            {text}
          </p>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-1 h-1 rounded-full animate-pulse',
                  colors.accent
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

export default AdvancedLoading
'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  variant?: 'default' | 'red' | 'blue' | 'green' | 'purple'
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text = 'Loading...',
  variant = 'default'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const variantClasses = {
    default: 'border-gray-600 border-t-white',
    red: 'border-red-900 border-t-red-400',
    blue: 'border-blue-900 border-t-blue-400',
    green: 'border-green-900 border-t-green-400',
    purple: 'border-purple-900 border-t-purple-400'
  }

  const textColors = {
    default: 'text-gray-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      {/* Spinning Circle */}
      <div className="relative">
        <div 
          className={cn(
            'animate-spin rounded-full border-2',
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        {/* Inner pulse effect */}
        <div 
          className={cn(
            'absolute inset-2 rounded-full animate-pulse',
            variant === 'default' ? 'bg-white/10' :
            variant === 'red' ? 'bg-red-400/10' :
            variant === 'blue' ? 'bg-blue-400/10' :
            variant === 'green' ? 'bg-green-400/10' :
            'bg-purple-400/10'
          )}
        />
      </div>
      
      {/* Loading text */}
      {text && (
        <p className={cn('text-sm font-medium', textColors[variant])}>
          {text}
        </p>
      )}
    </div>
  )
}

export function LoadingPage({ 
  text = 'Loading...', 
  variant = 'default' 
}: { 
  text?: string
  variant?: 'default' | 'red' | 'blue' | 'green' | 'purple'
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} variant={variant} />
        
        {/* Animated dots */}
        <div className="flex justify-center gap-1 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full animate-bounce',
                variant === 'default' ? 'bg-gray-400' :
                variant === 'red' ? 'bg-red-400' :
                variant === 'blue' ? 'bg-blue-400' :
                variant === 'green' ? 'bg-green-400' :
                'bg-purple-400'
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
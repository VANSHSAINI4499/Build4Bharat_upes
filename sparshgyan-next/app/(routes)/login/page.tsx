'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2, Accessibility } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AnimatedGradientText } from '@/components/magic/AnimatedGradientText'

export default function LoginPage() {
  const { signIn, signUp, user } = useAuth()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (user) {
    router.replace('/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      router.push('/dashboard')
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string }
      const code = firebaseErr.code ?? ''
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.')
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.')
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError(firebaseErr.message ?? 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4">
            <Accessibility className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">
            <AnimatedGradientText as="span">
              {isSignUp ? 'Create Account' : 'Parent Login'}
            </AnimatedGradientText>
          </h1>
          <p className="text-sm text-white/40">
            {isSignUp
              ? 'Sign up to track your child\'s accessibility learning'
              : 'Sign in to view your child\'s progress dashboard'}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="parent@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-600/10 px-4 py-2.5"
              >
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                <UserPlus className="h-4 w-4" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-5 pt-4 border-t border-white/6 text-center">
            <p className="text-sm text-white/40">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError('') }}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

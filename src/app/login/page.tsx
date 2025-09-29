'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isInvited, setIsInvited] = useState(false)
  const [isSettingPassword, setIsSettingPassword] = useState(false)

  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if this is an invited user
    const invited = searchParams.get('invited')
    const existing = searchParams.get('existing')

    const checkInvitedUser = async () => {
      // Check for URL errors (expired links, etc.)
      const urlError = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (urlError === 'access_denied' && errorDescription?.includes('expired')) {
        console.log('⚠️ Invitation link has expired')
        setError('Il link di invito è scaduto. Contatta l\'amministratore per un nuovo invito.')
        setIsInvited(true) // Still show invitation form for manual login
        return
      }

      // First, check URL parameters
      if (invited === 'true') {
        console.log('🎯 Detected invitation via URL parameter')
        setIsInvited(true)
      }

      // Also check if user is authenticated from email verification
      const { data: { user } } = await supabase.auth.getUser()
      console.log('🔍 Current user state:', user)

      if (user) {
        console.log('✅ User authenticated:', user.email)
        setEmail(user.email || '')

        // Check if this user was just created (sign-up flow)
        const createdAt = new Date(user.created_at)
        const now = new Date()
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

        console.log('⏰ User created', hoursSinceCreation.toFixed(1), 'hours ago')

        // If user was created recently (< 1 hour) and has no password confirmation, it's likely an invitation
        if (hoursSinceCreation < 1 && !user.email_confirmed_at) {
          console.log('🎉 Detected fresh invitation user!')
          setIsInvited(true)
          setIsSettingPassword(true)
          return
        }

        // If user is authenticated and email confirmed, redirect to dashboard
        if (user.email_confirmed_at) {
          console.log('📍 Redirecting authenticated user to dashboard')
          setSuccess(true)
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1000)
          return
        }
      }

      // Handle explicit invitation flows
      if (invited === 'true') {
        if (user && existing !== 'true') {
          setIsSettingPassword(true)
          setEmail('')
        }
      }
    }

    checkInvitedUser()
  }, [searchParams, supabase.auth])

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // For new invited users, update password
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Password setup error:', error)
        setError(error.message)
      } else {
        console.log('Password set successfully')
        setSuccess(true)
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      }
    } catch (err: any) {
      console.error('Password setup catch error:', err)
      setError('Errore nell\'impostazione della password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Attempting login with:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        setError(error.message)
      } else if (data.user) {
        console.log('Login successful:', data.user.email)
        setSuccess(true)
        
        // Aspetta un attimo per permettere al context di aggiornare
        setTimeout(() => {
          console.log('Redirecting to dashboard...')
          window.location.href = '/dashboard'
        }, 1000)
      }
    } catch (err: any) {
      console.error('Login catch error:', err)
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-green-600 mb-2">Login Riuscito! ✅</h2>
          <p className="text-muted-foreground">Reindirizzamento alla dashboard...</p>
          <a
            href="/dashboard"
            className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Vai alla Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground">SCH Pro</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSettingPassword
              ? 'Completa la tua registrazione impostando una password'
              : isInvited
                ? 'Benvenuto! Accedi con le tue credenziali'
                : 'Accedi al tuo account'
            }
          </p>
          {isInvited && (
            <div className={`mt-4 p-3 border rounded-md ${error ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
              <p className={`text-sm ${error ? 'text-orange-800' : 'text-blue-800'}`}>
                {error ? '⚠️ Link scaduto! ' : '🎉 Sei stato invitato a SCH Pro! '}
                {isSettingPassword
                  ? 'Imposta una password per completare la registrazione.'
                  : error
                    ? 'Inserisci manualmente email e password se le hai già impostate.'
                    : 'Benvenuto nella piattaforma.'
                }
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={isSettingPassword ? handlePasswordSetup : handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder={error ? "Inserisci l'email a cui è arrivato l'invito" : "Inserisci la tua email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || (isInvited && !error)}
                readOnly={isInvited && !error}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {isSettingPassword ? 'Imposta la tua password' : 'Password'}
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder={isSettingPassword ? 'Crea una password sicura' : 'Inserisci la tua password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={isSettingPassword ? 6 : undefined}
              />
              {isSettingPassword && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimo 6 caratteri
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                {isSettingPassword ? 'Impostazione password...' : 'Accesso in corso...'}
              </span>
            ) : (
              isSettingPassword ? 'Completa Registrazione' : 'Accedi'
            )}
          </button>
        </form>

        {/* Debug info */}
        <div className="mt-8 p-4 bg-muted rounded text-xs text-muted-foreground">
          <h3 className="font-semibold mb-2 text-foreground">Debug Info:</h3>
          <p>• Middleware: Disabilitato</p>
          <p>• Login page: Attiva</p>
          <p>• Redirect: Manual override</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Ship, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

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
    const invited = searchParams.get('invited')
    const existing = searchParams.get('existing')

    const checkInvitedUser = async () => {
      const urlError = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (urlError === 'access_denied' && errorDescription?.includes('expired')) {
        setError('Il link di invito e\u0300 scaduto. Inserisci email e password manualmente.')
        setIsInvited(true)
      }

      if (invited === 'true') {
        setIsInvited(true)
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setEmail(user.email || '')

        const createdAt = new Date(user.created_at)
        const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)

        if (hoursSinceCreation < 1 && !user.email_confirmed_at) {
          setIsInvited(true)
          setIsSettingPassword(true)
          return
        }

        if (user.email_confirmed_at) {
          setSuccess(true)
          setTimeout(() => { window.location.href = '/dashboard' }, 1000)
          return
        }
      }

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
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => { window.location.href = '/dashboard' }, 1000)
      }
    } catch {
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.user) {
        setSuccess(true)
        setTimeout(() => { window.location.href = '/dashboard' }, 1000)
      }
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (targetEmail?: string) => {
    const emailToReset = targetEmail || prompt('Inserisci la tua email per il reset password:', email || '')
    if (!emailToReset) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      alert(`Email di reset password inviata a ${emailToReset}.`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Success redirect state
  if (success) {
    return (
      <div className="text-center animate-fade-in">
        <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Accesso riuscito</h2>
        <p className="text-sm text-muted-foreground mb-4">Reindirizzamento alla dashboard...</p>
        <a
          href="/dashboard"
          className="text-sm text-primary hover:underline"
        >
          Vai alla Dashboard
        </a>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Logo & title */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-4">
          <Ship className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">SCH Pro</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {isSettingPassword
            ? 'Completa la registrazione impostando una password'
            : isInvited
              ? 'Benvenuto! Accedi con le tue credenziali'
              : 'Accedi al tuo account'
          }
        </p>
      </div>

      {/* Invitation banner */}
      {isInvited && (
        <div className={`mb-6 p-3 rounded-xl text-sm ${
          error
            ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20'
            : 'bg-primary/10 text-primary border border-primary/20'
        }`}>
          {error
            ? 'Link scaduto - inserisci email e password manualmente.'
            : isSettingPassword
              ? 'Imposta una password per completare la registrazione.'
              : 'Sei stato invitato a SCH Pro.'
          }
        </div>
      )}

      {/* Form */}
      <form onSubmit={isSettingPassword ? handlePasswordSetup : handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            required
            placeholder="nome@azienda.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            {isSettingPassword ? 'Nuova password' : 'Password'}
          </label>
          <Input
            id="password"
            type="password"
            required
            placeholder={isSettingPassword ? 'Crea una password sicura' : 'La tua password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={isSettingPassword ? 6 : undefined}
            autoComplete={isSettingPassword ? 'new-password' : 'current-password'}
          />
          {isSettingPassword && (
            <p className="text-xs text-muted-foreground">Minimo 6 caratteri</p>
          )}
        </div>

        {/* Error message */}
        {error && !isInvited && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isSettingPassword ? 'Impostazione...' : 'Accesso...'}
            </>
          ) : (
            <>
              {isSettingPassword ? 'Completa Registrazione' : 'Accedi'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Password reset link */}
      <div className="mt-6 text-center">
        <button
          onClick={() => handleResetPassword()}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Password dimenticata?
        </button>
      </div>

      {/* Extra reset for expired invitations */}
      {isInvited && error && (
        <div className="mt-4 text-center border-t border-border/50 pt-4">
          <p className="text-xs text-muted-foreground mb-2">
            Non hai mai impostato una password?
          </p>
          <button
            onClick={() => {
              if (!email) {
                setError('Inserisci prima la tua email')
                return
              }
              handleResetPassword(email)
            }}
            className="text-sm text-primary font-medium hover:underline"
          >
            Richiedi reset password
          </button>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/30 dark:via-background dark:to-purple-950/30" />

      {/* Decorative blurred circles */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-sm mx-4 p-8 rounded-3xl glass shadow-2xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-muted-foreground/50">
        SCH Pro &copy; {new Date().getFullYear()}
      </p>
    </div>
  )
}

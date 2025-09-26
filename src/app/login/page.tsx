'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('fabrizio.cagnucci@gmail.com') // Pre-compilata per test
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

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
          <p className="mt-2 text-sm text-muted-foreground">Accedi al tuo account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
                placeholder="Inserisci la tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Inserisci la tua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
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
                Accesso in corso...
              </span>
            ) : (
              'Accedi'
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
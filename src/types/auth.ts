/**
 * Tipi centralizzati per il sistema di autenticazione.
 * Usa AppUser per evitare conflitti con i tipi Supabase generati.
 */

export interface AppUserMetadata {
  name?: string
  full_name?: string
  avatar_url?: string
  picture?: string
  [key: string]: any
}

export interface AppUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
  user_metadata?: AppUserMetadata
  app_metadata?: {
    provider?: string
    providers?: string[]
    [key: string]: any
  }
}

/**
 * Dati sessione (estendibili).
 */
export interface AppSession {
  access_token: string
  expires_at?: number
  refresh_token?: string
  token_type?: string
  user: AppUser
}

/**
 * Interfaccia del contesto di autenticazione.
 */
export interface AuthContextType {
  user: AppUser | null
  session?: AppSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession?: () => Promise<void>
}

/**
 * Utente normalizzato per la UI.
 */
export interface NormalizedAuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
}

/**
 * Risultato standard per operazioni auth.
 */
export interface AuthResult<T = any> {
  ok: boolean
  data?: T
  error?: string
}

/**
 * Utility: risolve il nome visualizzato.
 */
export function resolveDisplayName(user: AppUser | null): string {
  if (!user) return 'User'
  const meta = user.user_metadata
  return (
    meta?.name ||
    meta?.full_name ||
    user.name ||
    user.email?.split('@')[0] ||
    'User'
  )
}

/**
 * Utility: risolve l'avatar URL.
 */
export function resolveAvatarUrl(user: AppUser | null): string | undefined {
  if (!user) return undefined
  const meta = user.user_metadata
  return meta?.avatar_url || meta?.picture || user.avatar_url
}
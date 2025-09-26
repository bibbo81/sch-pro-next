import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

interface UserSettings {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  notifications?: {
    email?: boolean
    push?: boolean
    sms?: boolean
  }
  display?: {
    density?: 'compact' | 'normal' | 'comfortable'
    showSidebar?: boolean
  }
}

class UserSettingsService {
  private supabase: ReturnType<typeof createBrowserClient<Database>>
  private settings: UserSettings | null = null
  private listeners: Set<(settings: UserSettings) => void> = new Set()

  constructor() {
    this.supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Initialize settings for current user
  async init() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return

      // Try to load existing settings
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        this.settings = data.settings as UserSettings
      } else if (error?.code === 'PGRST116') {
        // No settings found, create default
        await this.createDefaultSettings(user.id)
      }

      // Apply settings
      this.applySettings()
    } catch (error) {
      console.error('Failed to initialize user settings:', error)
    }
  }

  // Create default settings for a user
  private async createDefaultSettings(userId: string) {
    const defaultSettings: UserSettings = {
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      display: {
        density: 'normal',
        showSidebar: true
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          settings: defaultSettings as any
        })
        .select()
        .single()

      if (!error && data) {
        this.settings = defaultSettings
      }
    } catch (error) {
      console.error('Failed to create default settings:', error)
    }
  }

  // Get current settings
  getSettings(): UserSettings | null {
    return this.settings
  }

  // Update settings
  async updateSettings(updates: Partial<UserSettings>) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Merge with existing settings
      const newSettings = { ...this.settings, ...updates }

      // Save to database
      const { error } = await this.supabase
        .from('user_settings')
        .update({ settings: newSettings as any })
        .eq('user_id', user.id)

      if (error) throw error

      // Update local cache
      this.settings = newSettings

      // Apply settings
      this.applySettings()

      // Notify listeners
      this.notifyListeners()

      return newSettings
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }

  // Apply settings to UI
  private applySettings() {
    if (!this.settings) return

    // Apply theme
    if (this.settings.theme) {
      this.applyTheme(this.settings.theme)
    }

    // Apply other settings as needed
  }

  // Apply theme to document
  private applyTheme(theme: 'light' | 'dark' | 'system') {
    const root = document.documentElement

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme = prefersDark ? 'dark' : 'light'
    }

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Store preference
    localStorage.setItem('theme', theme)
  }

  // Subscribe to settings changes
  subscribe(callback: (settings: UserSettings) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Notify all listeners of settings change
  private notifyListeners() {
    if (!this.settings) return
    this.listeners.forEach(callback => callback(this.settings!))
  }

  // Get specific setting value
  getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] | undefined {
    return this.settings?.[key]
  }

  // Set specific setting value
  async setSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    return this.updateSettings({ [key]: value })
  }

  // Get current organization preference
  getCurrentOrganizationId(): string | null {
    return localStorage.getItem('currentOrganizationId')
  }

  // Set current organization preference
  setCurrentOrganizationId(orgId: string) {
    localStorage.setItem('currentOrganizationId', orgId)
  }

  // Clear all settings (on logout)
  clear() {
    this.settings = null
    localStorage.removeItem('theme')
    localStorage.removeItem('currentOrganizationId')
  }
}

// Export singleton instance
export const userSettingsService = new UserSettingsService()
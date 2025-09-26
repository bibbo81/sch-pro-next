'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Mail,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  LogOut,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

interface UserProfile {
  name?: string
  phone?: string
  company?: string
  bio?: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  marketing: boolean
  updates: boolean
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  // State management
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Profile settings
  const [profile, setProfile] = useState<UserProfile>({})
  const [profileChanged, setProfileChanged] = useState(false)

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: false,
    marketing: false,
    updates: true
  })
  const [notificationsChanged, setNotificationsChanged] = useState(false)

  // UI settings
  const [language, setLanguage] = useState('it')
  const [timezone, setTimezone] = useState('Europe/Rome')

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
    try {
      // Load user settings from your API
      // For now, using default values
      setProfile({
        name: user?.email?.split('@')[0] || '',
        phone: '',
        company: '',
        bio: ''
      })
    } catch (error) {
      console.error('Error loading user settings:', error)
    }
  }

  const handleProfileUpdate = async () => {
    if (!profileChanged) return

    try {
      setLoading(true)
      setError(null)

      // API call to update profile
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!response.ok) throw new Error('Failed to update profile')

      setSuccess('Profilo aggiornato con successo')
      setProfileChanged(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento del profilo')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    if (!notificationsChanged) return

    try {
      setLoading(true)
      setError(null)

      // API call to update notifications
      setSuccess('Impostazioni notifiche aggiornate')
      setNotificationsChanged(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento delle notifiche')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setError('Le password non corrispondono')
      return
    }

    if (passwordForm.new.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new
        })
      })

      if (!response.ok) throw new Error('Failed to change password')

      setSuccess('Password cambiata con successo')
      setPasswordForm({ current: '', new: '', confirm: '' })
      setShowPasswordForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel cambio password')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setLoading(true)
      await signOut()
    } catch (error) {
      setError('Errore durante il logout')
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setSuccess(null)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground">
          Gestisci il tuo profilo e le preferenze dell'account
        </p>
      </div>

      {/* Messages */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informazioni Profilo
            </CardTitle>
            <CardDescription>
              Aggiorna le tue informazioni personali e professionali
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <Badge variant="secondary">Verificata</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Il tuo nome"
                  value={profile.name || ''}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value })
                    setProfileChanged(true)
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  placeholder="+39 123 456 7890"
                  value={profile.phone || ''}
                  onChange={(e) => {
                    setProfile({ ...profile, phone: e.target.value })
                    setProfileChanged(true)
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Azienda</Label>
                <Input
                  id="company"
                  placeholder="Nome dell'azienda"
                  value={profile.company || ''}
                  onChange={(e) => {
                    setProfile({ ...profile, company: e.target.value })
                    setProfileChanged(true)
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Raccontaci qualcosa di te..."
                value={profile.bio || ''}
                onChange={(e) => {
                  setProfile({ ...profile, bio: e.target.value })
                  setProfileChanged(true)
                }}
                rows={3}
              />
            </div>

            {profileChanged && (
              <Button onClick={handleProfileUpdate} disabled={loading}>
                {loading ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifiche
            </CardTitle>
            <CardDescription>
              Configura come e quando ricevere le notifiche
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifiche Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Ricevi aggiornamenti importanti via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, email: checked })
                    setNotificationsChanged(true)
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifiche Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifiche in tempo reale nel browser
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, push: checked })
                    setNotificationsChanged(true)
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aggiornamenti Prodotto</Label>
                  <p className="text-sm text-muted-foreground">
                    Novità e aggiornamenti della piattaforma
                  </p>
                </div>
                <Switch
                  checked={notifications.updates}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, updates: checked })
                    setNotificationsChanged(true)
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Suggerimenti e offerte personalizzate
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, marketing: checked })
                    setNotificationsChanged(true)
                  }}
                />
              </div>
            </div>

            {notificationsChanged && (
              <Button onClick={handleNotificationUpdate} disabled={loading}>
                {loading ? 'Salvataggio...' : 'Salva Preferenze'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Theme and Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Aspetto e Localizzazione
            </CardTitle>
            <CardDescription>
              Personalizza l'aspetto e la lingua dell'applicazione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tema</Label>
                  <p className="text-sm text-muted-foreground">
                    Scegli il tema dell'interfaccia
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                  >
                    Chiaro
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                  >
                    Scuro
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                  >
                    Sistema
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lingua</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fuso Orario</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Rome">Europa/Roma</SelectItem>
                      <SelectItem value="Europe/London">Europa/Londra</SelectItem>
                      <SelectItem value="America/New_York">America/New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Sicurezza
            </CardTitle>
            <CardDescription>
              Gestisci password e impostazioni di sicurezza
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPasswordForm ? (
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
                className="w-full sm:w-auto"
              >
                <Key className="mr-2 h-4 w-4" />
                Cambia Password
              </Button>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Cambia Password</h4>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Password Attuale</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        placeholder="Password attuale"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nuova Password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        placeholder="Nuova password (min 6 caratteri)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Conferma Nuova Password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        placeholder="Ripeti nuova password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handlePasswordChange} disabled={loading}>
                    {loading ? 'Cambiando...' : 'Cambia Password'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPasswordForm({ current: '', new: '', confirm: '' })
                      clearMessages()
                    }}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Zona Pericolosa</CardTitle>
            <CardDescription>
              Azioni irreversibili per il tuo account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loading ? 'Disconnessione...' : 'Disconnetti Account'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
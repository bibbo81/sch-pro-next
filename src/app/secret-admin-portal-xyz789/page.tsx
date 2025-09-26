'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'

export default function SecretAdminPortal() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Activation form
  const [email, setEmail] = useState('')
  const [activationCode, setActivationCode] = useState('')

  useEffect(() => {
    checkSuperAdminStatus()
  }, [])

  const checkSuperAdminStatus = async () => {
    try {
      const response = await fetch('/api/super-admin/check')
      const data = await response.json()

      if (data.isSuperAdmin) {
        // User is already super admin, redirect to dashboard
        router.push('/super-admin')
        return
      }

      setIsSuperAdmin(false)
    } catch (error) {
      console.error('Error checking super admin status:', error)
      setIsSuperAdmin(false)
    }
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !activationCode) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/super-admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, activationCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Activation failed')
      }

      // Success - redirect to super admin dashboard
      router.push('/super-admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed')
    } finally {
      setLoading(false)
    }
  }

  if (isSuperAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (isSuperAdmin) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-red-900">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-900 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <CardTitle className="text-red-400">Super Admin Portal</CardTitle>
          <CardDescription className="text-gray-400">
            Restricted Access - Authorization Required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This area is restricted to system administrators only.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activationCode" className="text-gray-300">
                Activation Code
              </Label>
              <div className="relative">
                <Input
                  id="activationCode"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter activation code"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? 'Activating...' : 'Activate Super Admin Access'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Contact system administrator if you need access
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
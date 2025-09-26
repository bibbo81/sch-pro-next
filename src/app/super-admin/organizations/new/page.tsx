'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Building2, User, Mail, Key, AlertCircle } from 'lucide-react'

export default function NewOrganizationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Organization fields
  const [orgName, setOrgName] = useState('')
  const [orgDescription, setOrgDescription] = useState('')

  // Admin user fields
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminName, setAdminName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!orgName || !adminEmail || !adminPassword) {
      setError('Please fill in all required fields')
      return
    }

    if (adminPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/super-admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: orgName,
          organizationDescription: orgDescription,
          adminEmail,
          adminPassword,
          adminName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization')
      }

      // Redirect to organizations list
      router.push('/super-admin/organizations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Organization</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set up a new customer organization with an admin account
          </p>
        </div>
        <Link href="/super-admin/organizations">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>
              Basic information about the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name *</Label>
              <Input
                id="orgName"
                placeholder="Acme Corporation"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgDescription">Description (Optional)</Label>
              <Textarea
                id="orgDescription"
                placeholder="Brief description of the organization..."
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Admin Account
            </CardTitle>
            <CardDescription>
              Create the first admin user for this organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="flex items-center">
                <Mail className="mr-1 h-4 w-4" />
                Admin Email *
              </Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name (Optional)</Label>
              <Input
                id="adminName"
                placeholder="John Doe"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="flex items-center">
                <Key className="mr-1 h-4 w-4" />
                Admin Password *
              </Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Minimum 6 characters"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-sm text-muted-foreground">
                The admin will receive these credentials to access their organization
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Link href="/super-admin/organizations">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">What happens next?</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• A new organization will be created in the system</li>
            <li>• An admin account will be created with the provided credentials</li>
            <li>• The admin can log in and manage their organization independently</li>
            <li>• The admin can invite other users and manage permissions</li>
            <li>• You will retain super admin access to all organizations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
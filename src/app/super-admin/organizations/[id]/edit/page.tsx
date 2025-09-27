'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
  description?: string
  created_at: string
}

export default function SuperAdminEditOrganization() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.id as string

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchOrganization()
  }, [organizationId])

  const fetchOrganization = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/super-admin/organizations/${organizationId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch organization')
      }

      const data = await response.json()
      setOrganization(data.organization)
      setFormData({
        name: data.organization.name || '',
        description: data.organization.description || ''
      })
    } catch (error) {
      console.error('Error fetching organization:', error)
      setError('Failed to load organization details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Organization name is required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/super-admin/organizations/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update organization')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/super-admin/organizations/${organizationId}`)
      }, 1500)
    } catch (error) {
      console.error('Error updating organization:', error)
      setError(error instanceof Error ? error.message : 'Failed to update organization')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading organization details...</div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Organization not found or you don't have permission to access it.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Organization</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update organization information
          </p>
        </div>
        <Link href={`/super-admin/organizations/${organizationId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6">
          <AlertDescription>
            Organization updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Update the organization information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter organization name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter organization description (optional)"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/super-admin/organizations/${organizationId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
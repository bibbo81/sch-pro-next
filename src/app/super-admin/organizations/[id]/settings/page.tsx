'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function OrganizationSettingsPage({ params }: PageProps) {
  const router = useRouter()
  const [organizationId, setOrganizationId] = useState('')
  const [organization, setOrganization] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    settings: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setOrganizationId(resolvedParams.id)
      loadOrganization(resolvedParams.id)
    }
    getParams()
  }, [params])

  const loadOrganization = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/super-admin/organizations/${id}`)
      if (!response.ok) throw new Error('Failed to load organization')
      
      const data = await response.json()
      setOrganization(data)
      setFormData({
        name: data.name || '',
        description: data.description || '',
        settings: data.settings || {}
      })
    } catch (err) {
      setError('Failed to load organization')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      setMessage('')

      const response = await fetch(`/api/super-admin/organizations/${organizationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update organization')

      setMessage('Organization updated successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to update organization')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/super-admin/organizations/${organizationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete organization')

      router.push('/super-admin')
    } catch (err) {
      setError('Failed to delete organization')
      setShowDeleteConfirm(false)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-300 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/super-admin/organizations/${organizationId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organization
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure settings for {organization?.name}
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert className="mb-6 border-green-600 bg-green-600/10">
          <AlertDescription className="text-green-600">{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 border-red-600 bg-red-600/10">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update basic organization details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter organization description"
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>Advanced configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orgId">Organization ID</Label>
              <Input
                id="orgId"
                value={organizationId}
                disabled
                className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
              />
            </div>
            <div>
              <Label>Created</Label>
              <Input
                value={organization?.created_at ? new Date(organization.created_at).toLocaleString() : ''}
                disabled
                className="bg-gray-50 dark:bg-gray-900"
              />
            </div>
            <div>
              <Label>Last Updated</Label>
              <Input
                value={organization?.updated_at ? new Date(organization.updated_at).toLocaleString() : 'Never'}
                disabled
                className="bg-gray-50 dark:bg-gray-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Organization
              </Button>
            ) : (
              <div className="space-y-4">
                <Alert className="border-red-600 bg-red-600/10">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">
                    This action cannot be undone. This will permanently delete the organization
                    and all associated data including shipments, products, and member access.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
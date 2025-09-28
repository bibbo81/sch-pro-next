'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Plus, Trash2, Edit, Mail, UserPlus, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Member {
  id: string
  user_id: string
  role: string
  created_at: string
  restrict_to_own_records: boolean
  user?: {
    email: string
    full_name?: string
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ManageMembersPage({ params }: PageProps) {
  const [organizationId, setOrganizationId] = useState('')
  const [organization, setOrganization] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    email: '',
    fullName: '',
    role: 'member',
    restrictToOwnRecords: false
  })
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setOrganizationId(resolvedParams.id)
      loadOrganization(resolvedParams.id)
      loadMembers(resolvedParams.id)
    }
    getParams()
  }, [params])

  const loadOrganization = async (id: string) => {
    try {
      const response = await fetch(`/api/super-admin/organizations/${id}`, { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to load organization')
      const data = await response.json()
      setOrganization(data)
    } catch (err) {
      setError('Failed to load organization')
    }
  }

  const loadMembers = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/super-admin/organizations/${id}/members`, { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to load members')
      const data = await response.json()
      setMembers(data)
    } catch (err) {
      setError('Failed to load members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async () => {
    try {
      setIsAddingMember(true)
      setError('')
      
      const response = await fetch(`/api/super-admin/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: newMember.email,
          fullName: newMember.fullName || undefined,
          role: newMember.role,
          restrictToOwnRecords: newMember.restrictToOwnRecords
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add member')
      }

      setMessage('Member added successfully')
      setNewMember({ email: '', fullName: '', role: 'member', restrictToOwnRecords: false })
      setShowAddMember(false)
      loadMembers(organizationId)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/super-admin/organizations/${organizationId}/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) throw new Error('Failed to update member role')
      
      setMessage('Member role updated successfully')
      loadMembers(organizationId)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to update member role')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(`/api/super-admin/organizations/${organizationId}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to remove member')

      setMessage('Member removed successfully')
      loadMembers(organizationId)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to remove member')
    }
  }

  const startEditingName = (memberId: string, currentName: string) => {
    setEditingMember(memberId)
    setEditingName(currentName)
  }

  const cancelEditingName = () => {
    setEditingMember(null)
    setEditingName('')
  }

  const handleUpdateMemberName = async (memberId: string) => {
    try {
      const response = await fetch(`/api/super-admin/organizations/${organizationId}/members/${memberId}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName: editingName })
      })

      if (!response.ok) throw new Error('Failed to update member name')

      setMessage('Member name updated successfully')
      setEditingMember(null)
      setEditingName('')
      loadMembers(organizationId)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to update member name')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default'
      case 'admin': return 'secondary'
      case 'member': return 'outline'
      default: return 'outline'
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/super-admin/organizations/${organizationId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organization
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Manage Members</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {organization?.name} - {members.length} members
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddMember(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
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

      {/* Add Member Form */}
      {showAddMember && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Member</CardTitle>
            <CardDescription>Invite a new user to join this organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name (Optional)</Label>
              <Input
                id="fullName"
                type="text"
                value={newMember.fullName}
                onChange={(e) => setNewMember(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="e.g. Francesca Giorgetti"
              />
              <p className="text-sm text-gray-500 mt-1">If not provided, user can set it on first login</p>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="restrict"
                checked={newMember.restrictToOwnRecords}
                onCheckedChange={(checked) => setNewMember(prev => ({ ...prev, restrictToOwnRecords: checked }))}
              />
              <Label htmlFor="restrict">Restrict to own records only</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddMember} disabled={isAddingMember || !newMember.email}>
                <Plus className="h-4 w-4 mr-2" />
                {isAddingMember ? 'Adding...' : 'Add Member'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  {editingMember === member.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Enter full name"
                        className="max-w-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateMemberName(member.id)}
                        disabled={!editingName.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditingName}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">
                          {member.user?.full_name || member.user?.email || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {member.user?.email || `User ID: ${member.user_id}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingName(member.id, member.user?.full_name || member.user?.email?.split('@')[0] || '')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {member.role}
                  </Badge>
                  {member.restrict_to_own_records && (
                    <Badge variant="outline">Restricted</Badge>
                  )}
                </div>
                
                <Select
                  value={member.role}
                  onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {members.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No members found</p>
              <p className="text-sm text-gray-500">Add the first member to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
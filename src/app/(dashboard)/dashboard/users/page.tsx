'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, UserPlus, Shield, User, AlertCircle } from 'lucide-react'

interface OrganizationMember {
  id: string
  user_id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  restrict_to_own_records: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState('')

  // Invite user form state
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteRestrict, setInviteRestrict] = useState(false)
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
      setOrganizationName(data.organization?.name || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async () => {
    if (!inviteEmail) return

    try {
      setInviting(true)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          restrict_to_own_records: inviteRestrict
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to invite user')
      }

      // Reset form and refresh
      setInviteEmail('')
      setInviteRole('member')
      setInviteRestrict(false)
      setShowInviteDialog(false)
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user')
    } finally {
      setInviting(false)
    }
  }

  const handleUpdateUser = async (memberId: string, updates: Partial<OrganizationMember>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          ...updates
        })
      })

      if (!response.ok) throw new Error('Failed to update user')

      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  const handleRemoveUser = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this user from the organization?')) return

    try {
      const response = await fetch(`/api/users?memberId=${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove user')

      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'destructive'
      case 'admin':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
      case 'admin':
        return <Shield className="w-4 h-4 mr-1" />
      default:
        return <User className="w-4 h-4 mr-1" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and permissions for {organizationName}
          </p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User to Organization</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new user to your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="restrict"
                  checked={inviteRestrict}
                  onCheckedChange={setInviteRestrict}
                />
                <Label htmlFor="restrict">
                  Restrict to own records only
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteUser}
                disabled={inviting || !inviteEmail}
              >
                {inviting ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
          <CardDescription>
            View and manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Permissions</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-6 py-4">
                      <div className="font-medium">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleUpdateUser(user.id, { role: value as any })}
                        disabled={user.role === 'owner'}
                      >
                        <SelectTrigger className="w-32">
                          <div className="flex items-center">
                            {getRoleIcon(user.role)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {user.role === 'owner' && (
                            <SelectItem value="owner">Owner</SelectItem>
                          )}
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!user.restrict_to_own_records}
                          onCheckedChange={(checked) =>
                            handleUpdateUser(user.id, { restrict_to_own_records: !checked })
                          }
                          disabled={user.role === 'owner'}
                        />
                        <span className="text-sm">
                          {user.restrict_to_own_records ? 'Own records only' : 'All records'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
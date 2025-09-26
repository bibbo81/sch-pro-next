'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Check, Plus, ChevronDown } from 'lucide-react'

interface Organization {
  id: string
  name: string
  role: string
  isCurrent: boolean
  created_at?: string
}

export default function OrganizationSwitcher() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  // Create org dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      if (!response.ok) throw new Error('Failed to fetch organizations')

      const data = await response.json()
      setOrganizations(data.organizations)
      setCurrentOrg(data.organizations.find((org: Organization) => org.isCurrent) || null)
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchOrganization = async (orgId: string) => {
    if (switching || orgId === currentOrg?.id) return

    try {
      setSwitching(true)

      const response = await fetch('/api/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId })
      })

      if (!response.ok) throw new Error('Failed to switch organization')

      // Store preference in localStorage
      localStorage.setItem('currentOrganizationId', orgId)

      // Reload the page to refresh all data with new organization context
      window.location.reload()
    } catch (error) {
      console.error('Error switching organization:', error)
      setSwitching(false)
    }
  }

  const handleCreateOrganization = async () => {
    // This function is disabled - only super admins can create organizations
    console.log('Organization creation disabled for regular users')
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <Building2 className="h-4 w-4 animate-pulse" />
        <span className="text-sm animate-pulse">Loading...</span>
      </div>
    )
  }

  if (!currentOrg) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-3"
            disabled={switching}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium truncate">
                {currentOrg.name}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitchOrganization(org.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.role}</p>
                  </div>
                </div>
                {org.isCurrent && <Check className="h-4 w-4 ml-2" />}
              </div>
            </DropdownMenuItem>
          ))}

        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization. You will be set as the admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="Enter organization name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                setNewOrgName('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={creating || !newOrgName.trim()}
            >
              {creating ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
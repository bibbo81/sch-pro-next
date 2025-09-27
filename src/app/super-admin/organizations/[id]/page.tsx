import { notFound } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createSupabaseServer } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Package, Calendar, Settings } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  try {
    await requireSuperAdmin()
    const { id } = await params
    const supabase = await createSupabaseServer()

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (orgError || !organization) {
      notFound()
    }

    // Get organization members
    const { data: members } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        created_at,
        restrict_to_own_records
      `)
      .eq('organization_id', id)

    // Get organization shipments count
    const { count: shipmentsCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id)

    // Get organization products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id)

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/super-admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Super Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organization Details and Management
            </p>
          </div>
        </div>

        {/* Organization Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipments</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shipmentsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Total shipments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Products managed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(organization.created_at).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">Registration date</p>
            </CardContent>
          </Card>
        </div>

        {/* Organization Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Basic details and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg">{organization.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {organization.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p>{new Date(organization.created_at).toLocaleString()}</p>
              </div>
              {organization.updated_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p>{new Date(organization.updated_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>Users with access to this organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members && members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Member ID: {member.id}</p>
                        <p className="text-sm text-gray-600">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        {member.restrict_to_own_records && (
                          <Badge variant="outline">Restricted</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No members found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link href={`/super-admin/organizations/${id}/settings`}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Organization Settings
            </Button>
          </Link>
          <Link href={`/super-admin/organizations/${id}/members`}>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Members
            </Button>
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading organization:', error)
    notFound()
  }
}
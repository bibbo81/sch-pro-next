import { getSuperAdminStats } from '@/lib/auth-super-admin'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, Package, TrendingUp, ArrowLeft, Plus, Settings, Activity, Database, CreditCard, DollarSign } from 'lucide-react'

export default async function SuperAdminDashboard() {
  const stats = await getSuperAdminStats()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all organizations and system settings
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">All registered organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Across all organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrganizations30d}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Operational</div>
            <p className="text-xs text-muted-foreground">All systems running</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Organization Management</CardTitle>
            <CardDescription>Create and manage customer organizations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/super-admin/organizations/new" className="block">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Organization
              </Button>
            </Link>
            <Link href="/super-admin/organizations" className="block">
              <Button variant="outline" className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                View All Organizations
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscriptions</CardTitle>
            <CardDescription>Manage subscription plans and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/super-admin/billing/plans" className="block">
              <Button className="w-full">
                <DollarSign className="mr-2 h-4 w-4" />
                Subscription Plans
              </Button>
            </Link>
            <Link href="/super-admin/billing/subscriptions" className="block">
              <Button variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscriptions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>Configure system settings and monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/super-admin/monitoring" className="block">
              <Button className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                System Monitoring
              </Button>
            </Link>
            <Link href="/super-admin/performance" className="block">
              <Button className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance Analytics
              </Button>
            </Link>
            <Link href="/super-admin/storage" className="block">
              <Button className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Database Storage
              </Button>
            </Link>
            <Link href="/super-admin/database-health" className="block">
              <Button className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                Database Health
              </Button>
            </Link>
            <Link href="/super-admin/audit" className="block">
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                View Audit Logs
              </Button>
            </Link>
            <Link href="/super-admin/settings" className="block">
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Organizations</CardTitle>
          <CardDescription>Latest organizations created in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentOrganizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-gray-500">
                    Created {new Date(org.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/super-admin/organizations/${org.id}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
            ))}
            {stats.recentOrganizations.length === 0 && (
              <p className="text-gray-500 text-center py-4">No organizations yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
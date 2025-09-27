'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, Shield, Database, Mail, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    // Security settings
    sessionTimeout: '24',
    requireMFA: false,
    passwordComplexity: true,
    maxLoginAttempts: '5',

    // System settings
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    backupFrequency: 'daily',

    // Notification settings
    emailNotifications: true,
    adminAlerts: true,
    systemAlerts: true,
    notificationEmail: 'admin@company.com',

    // Organization defaults
    defaultOrgQuota: '1000',
    defaultUserQuota: '100',
    autoCreateOrg: true,
    orgApprovalRequired: false
  })

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // In a real implementation, this would save to a super admin settings API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    setSettings({
      sessionTimeout: '24',
      requireMFA: false,
      passwordComplexity: true,
      maxLoginAttempts: '5',
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      backupFrequency: 'daily',
      emailNotifications: true,
      adminAlerts: true,
      systemAlerts: true,
      notificationEmail: 'admin@company.com',
      defaultOrgQuota: '1000',
      defaultUserQuota: '100',
      autoCreateOrg: true,
      orgApprovalRequired: false
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure system-wide settings and security policies
          </p>
        </div>
        <Link href="/super-admin">
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
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure authentication and security policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                min="1"
                max="168"
              />
            </div>

            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                min="3"
                max="10"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireMFA">Require Multi-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Force all users to enable MFA</p>
              </div>
              <Switch
                id="requireMFA"
                checked={settings.requireMFA}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireMFA: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="passwordComplexity">Password Complexity Requirements</Label>
                <p className="text-sm text-muted-foreground">Enforce strong password policies</p>
              </div>
              <Switch
                id="passwordComplexity"
                checked={settings.passwordComplexity}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, passwordComplexity: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system behavior and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Disable access for all users except super admins</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="debugMode">Debug Mode</Label>
                <p className="text-sm text-muted-foreground">Enable detailed logging for troubleshooting</p>
              </div>
              <Switch
                id="debugMode"
                checked={settings.debugMode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, debugMode: checked }))}
              />
            </div>

            <div>
              <Label htmlFor="logLevel">Log Level</Label>
              <select
                id="logLevel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={settings.logLevel}
                onChange={(e) => setSettings(prev => ({ ...prev, logLevel: e.target.value }))}
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <select
                id="backupFrequency"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={settings.backupFrequency}
                onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure email alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="notificationEmail">Admin Notification Email</Label>
              <Input
                id="notificationEmail"
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                placeholder="admin@company.com"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="adminAlerts">Admin Alerts</Label>
                <p className="text-sm text-muted-foreground">Alerts for super admin actions</p>
              </div>
              <Switch
                id="adminAlerts"
                checked={settings.adminAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, adminAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="systemAlerts">System Alerts</Label>
                <p className="text-sm text-muted-foreground">Alerts for system errors and issues</p>
              </div>
              <Switch
                id="systemAlerts"
                checked={settings.systemAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, systemAlerts: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Organization Defaults
            </CardTitle>
            <CardDescription>
              Default settings for new organizations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="defaultOrgQuota">Default Organization Quota (shipments)</Label>
              <Input
                id="defaultOrgQuota"
                type="number"
                value={settings.defaultOrgQuota}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultOrgQuota: e.target.value }))}
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="defaultUserQuota">Default User Quota (per organization)</Label>
              <Input
                id="defaultUserQuota"
                type="number"
                value={settings.defaultUserQuota}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultUserQuota: e.target.value }))}
                min="1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoCreateOrg">Auto-create Organization</Label>
                <p className="text-sm text-muted-foreground">Automatically create organization for new users</p>
              </div>
              <Switch
                id="autoCreateOrg"
                checked={settings.autoCreateOrg}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoCreateOrg: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="orgApprovalRequired">Organization Approval Required</Label>
                <p className="text-sm text-muted-foreground">Require super admin approval for new organizations</p>
              </div>
              <Switch
                id="orgApprovalRequired"
                checked={settings.orgApprovalRequired}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, orgApprovalRequired: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
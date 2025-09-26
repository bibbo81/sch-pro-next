'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

export default function SuperAdminButton() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSuperAdminStatus()
  }, [])

  const checkSuperAdminStatus = async () => {
    try {
      // Check if current user is super admin
      const response = await fetch('/api/super-admin/check', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setIsSuperAdmin(data.isSuperAdmin)
      }
    } catch (error) {
      console.error('Error checking super admin status:', error)
      setIsSuperAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !isSuperAdmin) {
    return null
  }

  return (
    <Link href="/super-admin">
      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Shield className="mr-4 h-5 w-5" />
        Super Admin
      </Button>
    </Link>
  )
}
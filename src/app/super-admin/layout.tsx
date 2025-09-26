import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { redirect } from 'next/navigation'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireSuperAdmin()
  } catch (error) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-red-600 text-white py-2 px-4 text-center">
        <span className="font-semibold">⚠️ SUPER ADMIN AREA - Handle with care</span>
      </div>
      {children}
    </div>
  )
}
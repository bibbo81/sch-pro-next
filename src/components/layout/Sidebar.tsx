'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', current: false },
  { name: 'Tracking', href: '/tracking', icon: '📦', current: true },
  { name: 'Shipments', href: '/shipments', icon: '🚢', current: false },
  { name: 'Products', href: '/products', icon: '📋', current: false },
  { name: 'Costs', href: '/costs', icon: '💰', current: false },
  { name: 'Carriers', href: '/carriers', icon: '🏢', current: false },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Toggle button */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between text-white hover:bg-gray-800 p-2 rounded"
        >
          {!isCollapsed && <span className="font-semibold">Menu</span>}
          <svg 
            className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer info */}
      {!isCollapsed && (
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <p>SCH Pro v2.0</p>
            <p>Sistema Tracking</p>
          </div>
        </div>
      )}
    </div>
  )
}
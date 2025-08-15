'use client'

import { useState } from 'react'

export default function Header() {
  const [user] = useState({ name: 'Fabrizio Cagnucci', role: 'Admin' })

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo e titolo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">SCH Pro</h1>
            <span className="ml-2 text-sm text-gray-500">Sistema Gestione Spedizioni</span>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Cerca tracking, AWB, container..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifiche */}
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM10.5 9A1.5 1.5 0 009 7.5H15a1.5 1.5 0 00-1.5 1.5v1.5a1.5 1.5 0 001.5 1.5H9a1.5 1.5 0 00-1.5-1.5V9z"/>
              </svg>
            </button>

            {/* Profilo utente */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">FC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
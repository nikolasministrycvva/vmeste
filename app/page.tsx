'use client'

/**
 * Root page with test user selection
 * 
 * NOTE: This is a temporary mock implementation for development/testing.
 * In production, this will be replaced with Telegram WebApp authentication.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Role } from '@/lib/types'

interface TestUser {
  id: string
  name: string
  role: Role
  type: string
  trainerId?: string
}

export default function Home() {
  const router = useRouter()
  const { setCurrentUser, currentUserId } = useUser()
  const [testUsers, setTestUsers] = useState<TestUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTestUsers = async () => {
      try {
        const response = await fetch('/api/test-users')
        if (!response.ok) {
          throw new Error('Failed to load test users')
        }
        const data = await response.json()
        setTestUsers(data)
      } catch (error) {
        console.error('Error loading test users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTestUsers()
  }, [])

  const handleUserSelect = (user: TestUser) => {
    setCurrentUser(user.id, user.role)

    // Navigate to the appropriate page based on role
    switch (user.role) {
      case Role.CLIENT:
        router.push('/client')
        break
      case Role.TRAINER:
        router.push('/trainer')
        break
      case Role.ADMIN:
        router.push('/admin')
        break
      default:
        console.error('Unknown role:', user.role)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-8 px-6 max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">
          Vместе WebApp
        </h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Режим разработки:</strong> Выберите тестового пользователя для продолжения.
            Это временная заглушка - в продакшене аутентификация будет через Telegram WebApp.
          </p>
        </div>

        {currentUserId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Вход выполнен как: <strong>{testUsers.find(u => u.id === currentUserId)?.name || 'Неизвестно'}</strong>
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="text-gray-600">Загрузка тестовых пользователей...</div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Выберите тестового пользователя:
            </h2>
            
            {testUsers.length === 0 ? (
              <div className="text-red-600">
                Тестовые пользователи не найдены. Запустите seed скрипт: <code className="bg-gray-100 px-2 py-1 rounded">npm run prisma:seed</code>
              </div>
            ) : (
              testUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full text-left py-4 px-6 rounded-lg text-lg font-semibold transition-colors shadow-md ${
                    user.role === Role.CLIENT
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : user.role === Role.TRAINER
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{user.name}</span>
                    <span className="text-sm opacity-90">({user.role})</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

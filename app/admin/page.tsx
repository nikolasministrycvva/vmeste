'use client'

/**
 * Admin page for viewing studio schedule
 * 
 * NOTE: Uses UserContext for authentication (temporary mock).
 * In production, this will be replaced with Telegram WebApp authentication.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Role } from '@/lib/types'

interface Session {
  id: string
  trainerId: string
  trainerName: string
  workoutTypeId: string
  workoutTypeName: string
  startAt: string
  endAt: string
  maxClients: number
  activeBookings: number
  freeSpots: number
  status: string
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const { currentUserRole } = useUser()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string>('')
  const [trainerFilter, setTrainerFilter] = useState<string>('Все тренеры')

  // Redirect if not an admin
  useEffect(() => {
    if (currentUserRole && currentUserRole !== Role.ADMIN) {
      router.push('/')
    }
  }, [currentUserRole, router])

  // Load sessions based on filters
  const loadSessions = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query parameters
      const params = new URLSearchParams()
      if (dateFilter) {
        params.append('date', dateFilter)
      }
      if (trainerFilter && trainerFilter !== 'All trainers' && trainerFilter !== 'Все тренеры') {
        params.append('trainerId', trainerFilter)
      }

      const url = `/api/sessions${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to load sessions')
      }

      const data = await response.json()
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
      console.error('Error loading sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load sessions on mount and when filters change
  useEffect(() => {
    loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, trainerFilter])

  // Get unique trainer names and IDs from sessions
  const trainers = Array.from(
    new Map(
      sessions.map((session) => [session.trainerId, session.trainerName])
    ).entries()
  ).map(([id, name]) => ({ id, name }))

  // Format time from ISO string to HH:MM format
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Format time range from start and end ISO strings
  const formatTimeRange = (startAt: string, endAt: string): string => {
    return `${formatTime(startAt)}–${formatTime(endAt)}`
  }

  // Format date from ISO string to YYYY-MM-DD
  const formatDate = (isoString: string): string => {
    return isoString.split('T')[0]
  }

  // Get status badge color and text
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PLANNED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'FINISHED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'PLANNED':
        return 'Запланирована'
      case 'CANCELLED':
        return 'Отменена'
      case 'FINISHED':
        return 'Завершена'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Админ: Расписание студии
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Фильтры</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dateFilter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Дата
              </label>
              <input
                type="date"
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="trainerFilter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Тренер
              </label>
              <select
                id="trainerFilter"
                value={trainerFilter}
                onChange={(e) => setTrainerFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All trainers">Все тренеры</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 text-lg">Загрузка тренировок...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Время
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тренер
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тип тренировки
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Макс. клиентов
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                      >
                        Тренировки, соответствующие выбранным фильтрам, не найдены.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(session.startAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatTimeRange(session.startAt, session.endAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {session.trainerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {session.workoutTypeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {session.maxClients}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              session.status
                            )}`}
                          >
                            {getStatusText(session.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Показано {sessions.length} {sessions.length === 1 ? 'тренировка' : sessions.length < 5 ? 'тренировки' : 'тренировок'}
        </div>
      </div>
    </div>
  )
}

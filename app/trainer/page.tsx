'use client'

/**
 * Trainer page for managing training sessions
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
  trainerName: string
  workoutTypeName: string
  startAt: string
  endAt: string
  maxClients: number
  status: string
  freeSpots: number
}

interface WorkoutType {
  id: string
  name: string
  description: string | null
}

export default function TrainerPage() {
  const router = useRouter()
  const { currentUserId, currentUserRole } = useUser()
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingWorkoutTypes, setLoadingWorkoutTypes] = useState(false)
  const [loadingTrainerId, setLoadingTrainerId] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [creatingSession, setCreatingSession] = useState(false)
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null)

  // Redirect if not a trainer
  useEffect(() => {
    if (currentUserRole && currentUserRole !== Role.TRAINER) {
      router.push('/')
    }
  }, [currentUserRole, router])

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUserId) {
      router.push('/')
    }
  }, [currentUserId, router])

  // Load trainer ID from user ID
  useEffect(() => {
    const loadTrainerId = async () => {
      if (!currentUserId) {
        return
      }

      setLoadingTrainerId(true)
      try {
        const response = await fetch(`/api/trainers/by-user/${currentUserId}`)
        if (!response.ok) {
          throw new Error('Failed to load trainer ID')
        }
        const data = await response.json()
        setTrainerId(data.trainerId)
      } catch (err) {
        console.error('Error loading trainer ID:', err)
        setError('Failed to load trainer information')
      } finally {
        setLoadingTrainerId(false)
      }
    }

    loadTrainerId()
  }, [currentUserId])

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    duration: '1',
    workoutTypeId: '',
    maxClients: 5,
  })

  // Load workout types on mount
  useEffect(() => {
    const loadWorkoutTypes = async () => {
      setLoadingWorkoutTypes(true)
      try {
        const response = await fetch('/api/workout-types')
        if (!response.ok) {
          throw new Error('Failed to load workout types')
        }
        const data = await response.json()
        setWorkoutTypes(data)
        // Set default workout type if available
        if (data.length > 0) {
          setFormData((prev) => {
            if (!prev.workoutTypeId) {
              return { ...prev, workoutTypeId: data[0].id }
            }
            return prev
          })
        }
      } catch (err) {
        console.error('Error loading workout types:', err)
        setError('Failed to load workout types')
      } finally {
        setLoadingWorkoutTypes(false)
      }
    }

    loadWorkoutTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Load sessions when trainerId is available
  useEffect(() => {
    if (trainerId) {
      loadSessions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerId])

  const loadSessions = async () => {
    if (!trainerId) {
      return
    }

    setLoadingSessions(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions?trainerId=${trainerId}`)

      if (!response.ok) {
        throw new Error('Failed to load sessions')
      }

      const data = await response.json()
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
      console.error('Error loading sessions:', err)
    } finally {
      setLoadingSessions(false)
    }
  }

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

  // Check if session is in the future
  const isFutureSession = (startAt: string): boolean => {
    return new Date(startAt) > new Date()
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxClients' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!trainerId) {
      alert('Информация о тренере не загружена. Пожалуйста, подождите...')
      return
    }

    if (!formData.workoutTypeId) {
      setError('Пожалуйста, выберите тип тренировки')
      return
    }

    setCreatingSession(true)
    setError(null)
    setSuccessMessage('')

    try {
      // Build startAt and endAt ISO strings
      const dateString = formData.date
      const timeString = formData.startTime
      const durationHours = parseInt(formData.duration)

      // Combine date and time
      const startAt = new Date(`${dateString}T${timeString}`)
      const endAt = new Date(startAt)
      endAt.setHours(endAt.getHours() + durationHours)

      // Call API to create session
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainerId: trainerId,
          workoutTypeId: formData.workoutTypeId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          maxClients: formData.maxClients,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session')
      }

      // Clear form
      setFormData({
        date: '',
        startTime: '',
        duration: '1',
        workoutTypeId: workoutTypes.length > 0 ? workoutTypes[0].id : '',
        maxClients: 5,
      })

      // Show success message
      setSuccessMessage('Тренировка успешно создана!')
      setTimeout(() => setSuccessMessage(''), 3000)

      // Refresh sessions list
      await loadSessions()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session'
      setError(errorMessage)
      console.error('Error creating session:', err)
    } finally {
      setCreatingSession(false)
    }
  }

  const handleCancelSession = async (sessionId: string) => {
    setCancellingSessionId(sessionId)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${sessionId}/cancel`, {
        method: 'PATCH',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel session')
      }

      // Refresh sessions list
      await loadSessions()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel session'
      setError(errorMessage)
      alert(errorMessage)
      console.error('Error cancelling session:', err)
    } finally {
      setCancellingSessionId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Мои тренировки
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Sessions List */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Запланированные тренировки
          </h2>
          
          {loadingSessions ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">Загрузка тренировок...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">Пока нет запланированных тренировок.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-sm text-gray-500">Дата</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatDate(session.startAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Время</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatTimeRange(session.startAt, session.endAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Тип</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {session.workoutTypeName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Макс. клиентов</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {session.maxClients}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Свободных мест</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {session.freeSpots}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Статус</div>
                        <div className={`text-lg font-semibold ${
                          session.status === 'PLANNED' ? 'text-green-600' : 
                          session.status === 'CANCELLED' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {session.status === 'PLANNED' ? 'Запланирована' : 
                           session.status === 'CANCELLED' ? 'Отменена' : 
                           session.status === 'FINISHED' ? 'Завершена' : session.status}
                        </div>
                      </div>
                    </div>
                    
                    {isFutureSession(session.startAt) && session.status === 'PLANNED' && (
                      <button
                        onClick={() => handleCancelSession(session.id)}
                        disabled={cancellingSessionId === session.id}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors ml-6"
                      >
                        {cancellingSessionId === session.id ? 'Отмена...' : 'Отменить тренировку'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Session Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Создать новую тренировку
          </h2>

          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Дата
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Время начала
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Длительность
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1">1 час</option>
                  <option value="2">2 часа</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="workoutTypeId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Тип тренировки
                </label>
                {loadingWorkoutTypes ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    Загрузка...
                  </div>
                ) : (
                  <select
                    id="workoutTypeId"
                    name="workoutTypeId"
                    value={formData.workoutTypeId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {workoutTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label
                  htmlFor="maxClients"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Максимум клиентов
                </label>
                <input
                  type="number"
                  id="maxClients"
                  name="maxClients"
                  min="1"
                  max="10"
                  value={formData.maxClients}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={creatingSession}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                {creatingSession ? 'Создание...' : 'Создать тренировку'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

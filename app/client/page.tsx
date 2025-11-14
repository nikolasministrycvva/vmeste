'use client'

/**
 * Client page for booking training sessions
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
  capacityLeft: number
  isBookedByCurrentUser: boolean
  status: string
}

interface Booking {
  id: string
  sessionId: string
  status: string
  createdAt: string
  session: {
    id: string
    date: string
    startAt: string
    endAt: string
    trainerName: string
    workoutTypeName: string
    maxClients: number
  }
}

export default function ClientPage() {
  const router = useRouter()
  const { currentUserId, currentUserRole } = useUser()
  
  // Initialize selectedDate to today in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.toISOString().split('T')[0]
  }
  
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate())
  const [sessions, setSessions] = useState<Session[]>([])
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null)
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)

  // Redirect if not a client
  useEffect(() => {
    if (currentUserRole && currentUserRole !== Role.CLIENT) {
      router.push('/')
    }
  }, [currentUserRole, router])

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUserId) {
      router.push('/')
    }
  }, [currentUserId, router])

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

  // Format date from YYYY-MM-DD to display format
  const formatDateDisplay = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Завтра'
    if (diffDays === -1) return 'Вчера'
    if (diffDays > 1) return `Через ${diffDays} ${diffDays < 5 ? 'дня' : 'дней'}`
    if (diffDays < -1) return `${Math.abs(diffDays)} ${Math.abs(diffDays) < 5 ? 'дня' : 'дней'} назад`
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  }

  // Load sessions for the selected date
  const loadSessions = async () => {
    if (!currentUserId) {
      return
    }

    setLoadingSessions(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions?date=${selectedDate}&userId=${currentUserId}`)

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

  // Load user's bookings
  const loadMyBookings = async () => {
    if (!currentUserId) {
      return
    }

    setLoadingBookings(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/my?userId=${currentUserId}`)

      if (!response.ok) {
        throw new Error('Failed to load bookings')
      }

      const data = await response.json()
      setMyBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
      console.error('Error loading bookings:', err)
    } finally {
      setLoadingBookings(false)
    }
  }

  // Load data on mount and when date changes
  useEffect(() => {
    if (currentUserId) {
      loadSessions()
      loadMyBookings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, currentUserId])

  const handlePreviousDay = () => {
    const date = new Date(selectedDate + 'T00:00:00')
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const date = new Date(selectedDate + 'T00:00:00')
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleBook = async (session: Session) => {
    if (!currentUserId) {
      alert('Пожалуйста, войдите в систему для бронирования тренировки')
      return
    }

    setBookingInProgress(session.id)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          userId: currentUserId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error messages
        if (data.error === 'Session is full') {
          alert('К сожалению, все места заняты')
        } else if (data.error?.includes('already') || data.error?.includes('Already')) {
          alert('Вы уже записаны на эту тренировку')
        } else {
          alert(data.error || 'Не удалось забронировать тренировку')
        }
        throw new Error(data.error || 'Failed to book session')
      }

      // On success, reload both lists
      await Promise.all([loadSessions(), loadMyBookings()])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book session'
      setError(errorMessage)
      console.error('Error booking session:', err)
    } finally {
      setBookingInProgress(null)
    }
  }

  const handleCancel = async (booking: Booking) => {
    if (!currentUserId) {
      return
    }

    setCancellingBookingId(booking.id)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'x-user-id': currentUserId,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking')
      }

      // On success, reload both lists
      await Promise.all([loadSessions(), loadMyBookings()])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking'
      setError(errorMessage)
      alert(errorMessage)
      console.error('Error cancelling booking:', err)
    } finally {
      setCancellingBookingId(null)
    }
  }

  // Check if booking can be cancelled (at least 2 hours before session start)
  const canCancelBooking = (booking: Booking): boolean => {
    const sessionStart = new Date(booking.session.startAt)
    const now = new Date()
    const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilSession >= 2
  }

  // Get button text and disabled state for a session
  const getSessionButtonState = (session: Session) => {
    if (session.status !== 'PLANNED') {
      return { text: 'Недоступно', disabled: true }
    }
    if (session.capacityLeft <= 0) {
      return { text: 'Мест нет', disabled: true }
    }
    if (session.isBookedByCurrentUser) {
      return { text: 'Вы записаны', disabled: true }
    }
    return { text: 'Записаться', disabled: false }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Забронировать тренировку
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousDay}
              disabled={loadingSessions}
              className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Предыдущий день
            </button>
            
            <div className="text-xl font-semibold text-gray-800">
              {formatDateDisplay(selectedDate)}
            </div>
            
            <button
              onClick={handleNextDay}
              disabled={loadingSessions}
              className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Следующий день
            </button>
          </div>
        </div>

        {/* Training Sessions List */}
        <div className="space-y-4 mb-12">
          {loadingSessions ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">Загрузка...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">На эту дату нет доступных тренировок.</p>
            </div>
          ) : (
            sessions.map((session) => {
              const buttonState = getSessionButtonState(session)
              return (
                <div
                  key={session.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-6 mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatTimeRange(session.startAt, session.endAt)}
                        </span>
                        <span className="text-lg text-gray-700">
                          {session.trainerName}
                        </span>
                        <span className="text-lg text-gray-600 italic">
                          {session.workoutTypeName}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Свободно: {session.capacityLeft}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleBook(session)}
                      disabled={buttonState.disabled || bookingInProgress === session.id}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors ml-6"
                    >
                      {bookingInProgress === session.id ? 'Бронирование...' : buttonState.text}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* My Bookings Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Мои записи</h2>
          
          {loadingBookings ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">Загрузка...</p>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">У вас пока нет бронирований.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => {
                const canCancel = canCancelBooking(booking)
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatTimeRange(booking.session.startAt, booking.session.endAt)}
                        </span>
                        <span className="text-lg text-gray-700">
                          {booking.session.trainerName}
                        </span>
                        <span className="text-lg text-gray-600 italic">
                          {booking.session.workoutTypeName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {booking.session.date}
                        </span>
                      </div>
                      
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking)}
                          disabled={cancellingBookingId === booking.id}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors ml-6"
                        >
                          {cancellingBookingId === booking.id ? 'Отмена...' : 'Отменить'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

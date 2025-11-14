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
  freeSpots: number
  activeBookings: number
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
  const [selectedDate, setSelectedDate] = useState<string>('Today')
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

  // Convert date string to YYYY-MM-DD format
  const getDateString = (dateLabel: string): string => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (dateLabel) {
      case 'Today':
        return today.toISOString().split('T')[0]
      case 'Tomorrow':
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
      case 'Yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday.toISOString().split('T')[0]
      default:
        if (dateLabel.startsWith('In ')) {
          const days = parseInt(dateLabel.split(' ')[1]) || 0
          const futureDate = new Date(today)
          futureDate.setDate(futureDate.getDate() + days)
          return futureDate.toISOString().split('T')[0]
        } else if (dateLabel.endsWith(' days ago')) {
          const days = parseInt(dateLabel) || 0
          const pastDate = new Date(today)
          pastDate.setDate(pastDate.getDate() - days)
          return pastDate.toISOString().split('T')[0]
        }
        return today.toISOString().split('T')[0]
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

  // Load sessions for the selected date
  const loadSessions = async (dateLabel: string) => {
    if (!currentUserId) {
      return
    }

    setLoadingSessions(true)
    setError(null)

    try {
      const dateString = getDateString(dateLabel)
      const response = await fetch(`/api/sessions?date=${dateString}`)

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
      const response = await fetch('/api/bookings/my', {
        headers: {
          'x-user-id': currentUserId,
        },
      })

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
    loadSessions(selectedDate)
    loadMyBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]) // Only reload when selectedDate changes

  const handlePreviousDay = () => {
    if (selectedDate === 'Today') {
      setSelectedDate('Yesterday')
    } else if (selectedDate === 'Yesterday') {
      setSelectedDate('2 days ago')
    } else if (selectedDate === 'Tomorrow') {
      setSelectedDate('Today')
    } else if (selectedDate.startsWith('In ')) {
      const days = parseInt(selectedDate.split(' ')[1]) || 2
      if (days === 2) {
        setSelectedDate('Tomorrow')
      } else {
        setSelectedDate(`In ${days - 1} days`)
      }
    } else if (selectedDate.endsWith(' days ago')) {
      const days = parseInt(selectedDate) || 2
      if (days === 2) {
        setSelectedDate('Yesterday')
      } else {
        setSelectedDate(`${days - 1} days ago`)
      }
    }
  }

  const handleNextDay = () => {
    if (selectedDate === 'Today') {
      setSelectedDate('Tomorrow')
    } else if (selectedDate === 'Tomorrow') {
      setSelectedDate('In 2 days')
    } else if (selectedDate === 'Yesterday') {
      setSelectedDate('Today')
    } else if (selectedDate === '2 days ago') {
      setSelectedDate('Yesterday')
    } else if (selectedDate.startsWith('In ')) {
      const days = parseInt(selectedDate.split(' ')[1]) || 2
      setSelectedDate(`In ${days + 1} days`)
    } else if (selectedDate.endsWith(' days ago')) {
      const days = parseInt(selectedDate) || 2
      if (days === 2) {
        setSelectedDate('Yesterday')
      } else {
        setSelectedDate(`${days - 1} days ago`)
      }
    }
  }

  // Format date label for display
  const formatDateLabel = (dateLabel: string): string => {
    if (dateLabel === 'Today') return 'Сегодня'
    if (dateLabel === 'Tomorrow') return 'Завтра'
    if (dateLabel === 'Yesterday') return 'Вчера'
    if (dateLabel.startsWith('In ')) {
      const days = parseInt(dateLabel.split(' ')[1]) || 0
      if (days === 1) return 'Завтра'
      return `Через ${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`
    }
    if (dateLabel.endsWith(' days ago')) {
      const days = parseInt(dateLabel) || 0
      if (days === 1) return 'Вчера'
      return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`
    }
    return dateLabel
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
        throw new Error(data.error || 'Failed to book session')
      }

      alert('Тренировка успешно забронирована!')
      // Refresh both lists
      await Promise.all([loadSessions(selectedDate), loadMyBookings()])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book session'
      setError(errorMessage)
      alert(errorMessage)
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

      alert('Бронирование успешно отменено')
      // Refresh both lists
      await Promise.all([loadSessions(selectedDate), loadMyBookings()])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking'
      setError(errorMessage)
      alert(errorMessage)
      console.error('Error cancelling booking:', err)
    } finally {
      setCancellingBookingId(null)
    }
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
              {formatDateLabel(selectedDate)}
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
              <p className="text-gray-600 text-lg">Загрузка тренировок...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">На эту дату нет доступных тренировок.</p>
            </div>
          ) : (
            sessions.map((session) => (
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
                      {session.freeSpots} {session.freeSpots === 1 ? 'свободное место' : session.freeSpots < 5 ? 'свободных места' : 'свободных мест'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleBook(session)}
                    disabled={session.freeSpots === 0 || bookingInProgress === session.id}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors ml-6"
                  >
                    {bookingInProgress === session.id ? 'Бронирование...' : 'Забронировать'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* My Bookings Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Мои бронирования</h2>
          
          {loadingBookings ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">Загрузка бронирований...</p>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">У вас пока нет бронирований.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => (
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
                    
                    <button
                      onClick={() => handleCancel(booking)}
                      disabled={cancellingBookingId === booking.id}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors ml-6"
                    >
                      {cancellingBookingId === booking.id ? 'Отмена...' : 'Отменить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

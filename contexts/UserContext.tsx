'use client'

/**
 * User Context for managing current user state
 * 
 * NOTE: This is a temporary mock implementation for development/testing.
 * In production, this will be replaced with Telegram WebApp authentication.
 * 
 * The context stores:
 * - currentUserId: The ID of the currently logged-in user
 * - currentUserRole: The role of the current user (CLIENT, TRAINER, ADMIN)
 * - setCurrentUser: Function to update the current user
 * 
 * User selection is persisted in localStorage for convenience during development.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Role } from '@/lib/types'

interface UserContextType {
  currentUserId: string | null
  currentUserRole: Role | null
  setCurrentUser: (userId: string, role: Role) => void
  clearCurrentUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const STORAGE_KEY = 'currentUser'

interface UserContextProviderProps {
  children: ReactNode
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { userId, role } = JSON.parse(stored)
        setCurrentUserId(userId)
        setCurrentUserRole(role)
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error)
    }
  }, [])

  const setCurrentUser = (userId: string, role: Role) => {
    setCurrentUserId(userId)
    setCurrentUserRole(role)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, role }))
    } catch (error) {
      console.error('Error saving user to localStorage:', error)
    }
  }

  const clearCurrentUser = () => {
    setCurrentUserId(null)
    setCurrentUserRole(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing user from localStorage:', error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        currentUserId,
        currentUserRole,
        setCurrentUser,
        clearCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserContextProvider')
  }
  return context
}





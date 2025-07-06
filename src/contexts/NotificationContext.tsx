import React, { createContext, useContext, useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'loading'
  title: string
  message?: string
  duration?: number
  autoHide?: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
  clearAllNotifications: () => void
  showLoading: (title: string, message?: string) => string
  showSuccess: (title: string, message?: string) => string
  showError: (title: string, message?: string) => string
  showInfo: (title: string, message?: string) => string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId()
    const newNotification: Notification = {
      id,
      autoHide: true,
      duration: 5000,
      ...notification,
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-hide si activé
    if (newNotification.autoHide && newNotification.type !== 'loading') {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    )
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const showLoading = useCallback((title: string, message?: string) => {
    return addNotification({
      type: 'loading',
      title,
      message,
      autoHide: false
    })
  }, [addNotification])

  const showSuccess = useCallback((title: string, message?: string) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 3000
    })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000
    })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 5000
    })
  }, [addNotification])

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    updateNotification,
    clearAllNotifications,
    showLoading,
    showSuccess,
    showError,
    showInfo
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
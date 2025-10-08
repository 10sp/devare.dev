import React, { useEffect } from 'react'
import './NotificationOverlay.css'

type NotificationOverlayProps = {
  message: string
  isVisible: boolean
  onClose: () => void
}

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  message,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-content" onClick={(e) => e.stopPropagation()}>
        <div className="notification-message">{message}</div>
        <button className="notification-close" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  )
}

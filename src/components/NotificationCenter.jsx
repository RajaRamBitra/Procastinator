import { useEffect, useState } from 'react'

function NotificationCenter({ message, onDismiss }) {
  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window
  const [permission, setPermission] = useState(
    notificationsSupported ? window.Notification.permission : 'unsupported',
  )

  const requestPermission = async () => {
    if (!notificationsSupported) {
      return
    }

    const result = await window.Notification.requestPermission()
    setPermission(result)
  }

  useEffect(() => {
    if (!message || !notificationsSupported || permission !== 'granted') {
      return
    }

    new window.Notification(message)
  }, [message, notificationsSupported, permission])

  const showToast = Boolean(message) && (!notificationsSupported || permission !== 'granted')

  return (
    <section className="card notifications-card" aria-label="Notifications">
      <h2>Reminders</h2>
      <p>
        Notification status:{' '}
        <strong>
          {permission === 'unsupported' ? 'Browser notifications not supported' : permission}
        </strong>
      </p>
      {permission !== 'granted' && notificationsSupported && (
        <button type="button" onClick={requestPermission}>
          Request notification permission
        </button>
      )}
      {!notificationsSupported && (
        <p className="muted">Notifications are unavailable in this browser; in-app reminders will be used.</p>
      )}

      {showToast && (
        <div className="toast" role="status" aria-live="polite">
          <span>{message}</span>
          <button type="button" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      )}
    </section>
  )
}

export default NotificationCenter

import { useEffect, useMemo, useState } from 'react'
import NotificationCenter from './NotificationCenter'
import PomodoroTimer from './PomodoroTimer'
import ProgressBars from './ProgressBars'
import { fetchTasks, logPomodoroSession, upsertMainTask } from '../lib/taskService'
import { hasSupabaseConfig, supabaseConfigHint } from '../lib/supabase'

function Dashboard() {
  const [mainTask, setMainTask] = useState('')
  const [taskCompleted, setTaskCompleted] = useState(false)
  const [saveState, setSaveState] = useState('')
  const [completedSessions, setCompletedSessions] = useState(0)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [notificationMessage, setNotificationMessage] = useState('')

  useEffect(() => {
    let active = true

    const loadMainTask = async () => {
      const { data, error } = await fetchTasks()

      if (!active) {
        return
      }

      if (error) {
        if (!hasSupabaseConfig) {
          setSaveState('Using local mode. Configure Supabase to sync data.')
        } else {
          setSaveState('Could not load tasks from Supabase. Using local mode.')
        }
        return
      }

      const existingMainTask = data.find((task) => task.is_main)
      if (existingMainTask) {
        setMainTask(existingMainTask.title ?? '')
        setTaskCompleted(Boolean(existingMainTask.completed))
      }
    }

    loadMainTask()

    return () => {
      active = false
    }
  }, [])

  const handleSaveMainTask = async () => {
    if (!mainTask.trim()) {
      setSaveState('Please enter a main task before saving.')
      return
    }

    if (!hasSupabaseConfig) {
      setSaveState('Main task saved locally. Add Supabase env vars to sync online.')
      return
    }

    const { error } = await upsertMainTask({
      title: mainTask.trim(),
      completed: taskCompleted,
    })

    if (error) {
      setSaveState('Failed to save main task to Supabase. Keeping local state only.')
      return
    }

    setSaveState('Main task synced to Supabase.')
  }

  const handleSessionComplete = async (session) => {
    setCompletedSessions((count) => count + 1)
    setNotificationMessage(`${session.mode === 'focus' ? 'Focus' : 'Short break'} session complete.`)

    if (!hasSupabaseConfig) {
      return
    }

    await logPomodoroSession(session)
  }

  const dailyProgress = useMemo(() => {
    const score = completedSessions + (taskCompleted ? 1 : 0)
    return Math.min(100, Math.round((score / 5) * 100))
  }, [completedSessions, taskCompleted])

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Procastinator</h1>
        <p>Stay focused with one main task, timed sessions, and clear progress tracking.</p>
      </header>

      {!hasSupabaseConfig && (
        <section className="banner" role="note" aria-label="Supabase setup guidance">
          <strong>Supabase not configured.</strong> {supabaseConfigHint}
        </section>
      )}

      <section className="card task-card" aria-label="Main task">
        <h2>Main Task</h2>
        <label htmlFor="main-task-input">What is your primary task right now?</label>
        <input
          id="main-task-input"
          type="text"
          value={mainTask}
          onChange={(event) => setMainTask(event.target.value)}
          placeholder="Write project proposal"
        />
        <label className="checkbox-row" htmlFor="task-completed">
          <input
            id="task-completed"
            type="checkbox"
            checked={taskCompleted}
            onChange={(event) => setTaskCompleted(event.target.checked)}
          />
          Mark task complete
        </label>
        <button type="button" onClick={handleSaveMainTask}>
          Save main task
        </button>
        {saveState && <p className="muted">{saveState}</p>}
      </section>

      <PomodoroTimer
        onSessionComplete={handleSessionComplete}
        onProgressChange={setSessionProgress}
      />

      <ProgressBars sessionProgress={sessionProgress} dailyProgress={dailyProgress} />

      <NotificationCenter
        message={notificationMessage}
        onDismiss={() => setNotificationMessage('')}
      />
    </main>
  )
}

export default Dashboard

import { useEffect, useMemo, useState } from 'react'

const MODE_SETTINGS = {
  focus: { label: 'Focus', minutes: 25 },
  shortBreak: { label: 'Short break', minutes: 5 },
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function PomodoroTimer({ onSessionComplete, onProgressChange }) {
  const [mode, setMode] = useState('focus')
  const [isRunning, setIsRunning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(MODE_SETTINGS.focus.minutes * 60)

  const totalSeconds = useMemo(() => MODE_SETTINGS[mode].minutes * 60, [mode])

  useEffect(() => {
    onProgressChange?.(Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100))
  }, [onProgressChange, remainingSeconds, totalSeconds])

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval)
          setIsRunning(false)
          onSessionComplete?.({
            mode,
            durationMinutes: MODE_SETTINGS[mode].minutes,
            completed: true,
          })
          return 0
        }

        return previous - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, mode, onSessionComplete])

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setIsRunning(false)
    setRemainingSeconds(MODE_SETTINGS[nextMode].minutes * 60)
    onProgressChange?.(0)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setRemainingSeconds(totalSeconds)
    onProgressChange?.(0)
  }

  return (
    <section className="card timer-card" aria-label="Pomodoro timer">
      <h2>Pomodoro Timer</h2>
      <p className="timer-mode">{MODE_SETTINGS[mode].label} mode</p>
      <p className="timer-value">{formatTime(remainingSeconds)}</p>

      <div className="mode-switch" role="tablist" aria-label="Timer modes">
        <button
          type="button"
          className={mode === 'focus' ? 'active' : ''}
          onClick={() => switchMode('focus')}
        >
          Focus 25:00
        </button>
        <button
          type="button"
          className={mode === 'shortBreak' ? 'active' : ''}
          onClick={() => switchMode('shortBreak')}
        >
          Short break 05:00
        </button>
      </div>

      <div className="controls">
        <button type="button" onClick={() => setIsRunning(true)} disabled={isRunning || remainingSeconds === 0}>
          Start
        </button>
        <button type="button" onClick={() => setIsRunning(false)} disabled={!isRunning}>
          Pause
        </button>
        <button type="button" onClick={resetTimer}>
          Reset
        </button>
      </div>
    </section>
  )
}

export default PomodoroTimer

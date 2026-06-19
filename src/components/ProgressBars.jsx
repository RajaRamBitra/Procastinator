function ProgressBars({ sessionProgress, dailyProgress }) {
  return (
    <section className="card progress-card" aria-label="Progress overview">
      <h2>Progress</h2>

      <div className="progress-row">
        <div className="progress-label-row">
          <span>Current Pomodoro session</span>
          <span>{sessionProgress}%</span>
        </div>
        <progress max="100" value={sessionProgress} />
      </div>

      <div className="progress-row">
        <div className="progress-label-row">
          <span>Daily completion</span>
          <span>{dailyProgress}%</span>
        </div>
        <progress max="100" value={dailyProgress} />
      </div>
    </section>
  )
}

export default ProgressBars

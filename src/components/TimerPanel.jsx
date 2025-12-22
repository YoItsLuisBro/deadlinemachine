import React, { useState, useEffect } from "react";

function TimerPanel() {
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      setSecondsLeft(durationMinutes * 60);
    }
  }, [durationMinutes, running]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const minutesDisplay = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secondsDisplay = String(secondsLeft % 60).padStart(2, "0");

  const handleDurationChange = (e) => {
    const value = Number(e.target.value);
    if (!Number.isNaN(value) && value > 0 && value <= 999) {
      setDurationMinutes(value);
    }
  };

  const toggleRunning = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(durationMinutes * 60);
    }
    setRunning((prev) => !prev);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(durationMinutes * 60);
  };

  const finished = secondsLeft === 0;

  return (
    <section className="timer-panel">
      <div className="timer-header">
        <div className="timer-title">FOCUS ENGINE</div>
        <div className="timer-subtitle">ONE TASK. ONE CLOCK.</div>
      </div>

      <div className="timer-display">
        <div className="timer-label-row">
          <span className="timer-label">MIN</span>
          <span className="timer-label">SEC</span>
        </div>
        <div className="timer-digits">
          <span className="timer-digit">{minutesDisplay}</span>
          <span className="timer-separator">:</span>
          <span className="timer-digit">{secondsDisplay}</span>
        </div>
        {finished && (
          <div className="timer-alert">TIME&apos;S UP. STOP HESITATING.</div>
        )}
      </div>

      <div className="timer-controls">
        <div className="timer-input-group">
          <label className="timer-input-label">DURATION (MIN)</label>
          <input
            type="number"
            min="1"
            max="999"
            value={durationMinutes}
            onChange={handleDurationChange}
            className="timer-input"
          />
        </div>
        <div className="timer-button-row">
          <button
            className="timer-button timer-button-primary"
            onClick={toggleRunning}
          >
            {running ? "PAUSE" : "START"}
          </button>
          <button
            className="timer-button timer-button-secondary"
            onClick={reset}
          >
            RESET
          </button>
        </div>
      </div>

      <div className="timer-footer-strip">
        WARNING: THIS MACHINE DOES NOT CARE HOW YOU FEEL.
      </div>
    </section>
  );
}

export default TimerPanel;

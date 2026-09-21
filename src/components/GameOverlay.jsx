import React from 'react';

export const GameOverlay = ({
  gameOver,
  won,
  score,
  bestScore,
  onRestart,
  onContinue,
  onUndo,
  undosRemaining,
  canUndo,
}) => {
  if (!gameOver && !won) return null;

  const formatNumber = (num) => new Intl.NumberFormat().format(num || 0);

  if (won) {
    return (
      <div className="game-overlay win-overlay" role="dialog" aria-modal="true" aria-label="System Unlocked">
        <div className="overlay-content">
          <div className="milestone-badge">SYSTEM UNLOCKED</div>
          <h2 className="overlay-title gold-text">2048 ACHIEVED</h2>
          <p className="overlay-subtitle">Energy core matrix stabilized at maximum capacity.</p>

          <div className="overlay-stats">
            <div className="stat-item">
              <span className="stat-label">CURRENT SCORE</span>
              <span className="stat-val">{formatNumber(score)}</span>
            </div>
          </div>

          <div className="overlay-actions">
            <button
              type="button"
              className="overlay-btn primary-btn"
              onClick={onContinue}
            >
              KEEP GOING
            </button>
            <button
              type="button"
              className="overlay-btn secondary-btn"
              onClick={onRestart}
            >
              NEW GAME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-overlay game-over-overlay" role="dialog" aria-modal="true" aria-label="System Error">
      <div className="overlay-content">
        <div className="milestone-badge">GRID COLLAPSED</div>
        <h2 className="overlay-title">SYSTEM ERROR</h2>
        <p className="overlay-subtitle">No remaining vectors in the energy grid.</p>

        <div className="overlay-stats">
          <div className="stat-item">
            <span className="stat-label">FINAL SCORE</span>
            <span className="stat-val">{formatNumber(score)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">BEST RECORD</span>
            <span className="stat-val">{formatNumber(bestScore)}</span>
          </div>
        </div>

        <div className="overlay-actions">
          {canUndo && (
            <button
              type="button"
              className="overlay-btn primary-btn undo-overlay-btn"
              onClick={onUndo}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C20.91 11.23 17.07 8 12.5 8z" />
              </svg>
              <span>UNDO MOVE ({undosRemaining} LEFT)</span>
            </button>
          )}
          <button
            type="button"
            className={`overlay-btn ${canUndo ? 'secondary-btn' : 'primary-btn'}`}
            onClick={onRestart}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
};

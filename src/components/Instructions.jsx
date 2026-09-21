import React from 'react';

export const Instructions = () => {
  return (
    <div className="game-instructions">
      <div className="instructions-header">
        <svg
          className="swipe-hint-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z" />
        </svg>
        <span className="instructions-title">SWIPE TO SHIFT GRID</span>
      </div>
      <p className="instructions-desc">
        Merge identical energy cores to synthesize the <strong>2048</strong> singularity.
      </p>
    </div>
  );
};

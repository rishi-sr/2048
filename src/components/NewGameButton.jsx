import React from 'react';

export const NewGameButton = ({ onRestart }) => {
  return (
    <button
      type="button"
      className="new-game-btn"
      onClick={onRestart}
      aria-label="Start a new game"
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
      <span>NEW GAME</span>
    </button>
  );
};

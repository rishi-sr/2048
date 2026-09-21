import React from 'react';
import { Header } from './Header';
import { ScoreBoard } from './ScoreBoard';
import { GameBoard } from './GameBoard';
import { Instructions } from './Instructions';
import { NewGameButton } from './NewGameButton';
import { useGame } from '../hooks/useGame';

export const Game = () => {
  const {
    tiles,
    score,
    bestScore,
    scoreAddition,
    gameOver,
    won,
    isMuted,
    undosRemaining,
    canUndo,
    move,
    undo,
    restart,
    continuePlaying,
    toggleSound,
  } = useGame();

  return (
    <main className="mobile-game-container">
      {/* 1. Safe mobile top padding + Header */}
      <Header isMuted={isMuted} onToggleSound={toggleSound} />

      {/* 2. Score Section */}
      <ScoreBoard
        score={score}
        bestScore={bestScore}
        scoreAddition={scoreAddition}
      />

      {/* 3. 4x4 Game Board (Hero element) */}
      <GameBoard
        tiles={tiles}
        gameOver={gameOver}
        won={won}
        score={score}
        bestScore={bestScore}
        onRestart={restart}
        onContinue={continuePlaying}
        onMove={move}
        onUndo={undo}
        undosRemaining={undosRemaining}
        canUndo={canUndo}
      />

      {/* 4. Small Instruction / Help Area */}
      <Instructions />

      {/* 5. Footer Actions: Undo & New Game */}
      <div className="game-footer">
        <button
          type="button"
          className={`undo-btn ${!canUndo ? 'disabled' : ''}`}
          onClick={undo}
          disabled={!canUndo}
          aria-label={`Undo last move (${undosRemaining} remaining)`}
          title={canUndo ? `Undo move (${undosRemaining} left)` : 'No undos available'}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C20.91 11.23 17.07 8 12.5 8z" />
          </svg>
          <span>UNDO ({undosRemaining})</span>
        </button>

        <NewGameButton onRestart={restart} />
      </div>
    </main>
  );
};

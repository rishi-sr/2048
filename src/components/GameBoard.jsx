import React, { useRef } from 'react';
import { Tile } from './Tile';
import { GameOverlay } from './GameOverlay';
import { useSwipe } from '../hooks/useSwipe';
import { GRID_SIZE } from '../utils/gameLogic';

export const GameBoard = ({
  tiles,
  gameOver,
  won,
  score,
  bestScore,
  onRestart,
  onContinue,
  onMove,
  onUndo,
  undosRemaining,
  canUndo,
}) => {
  const boardRef = useRef(null);

  // Bind touch, mouse drag, and keyboard gestures directly to the board
  // If game is over but user can still undo, allow the keyboard undo shortcut!
  useSwipe(onMove, boardRef, (gameOver && !canUndo) || won, onUndo);

  // Generate 16 static socket cavities
  const totalCells = GRID_SIZE * GRID_SIZE;
  const socketCells = Array.from({ length: totalCells }, (_, idx) => (
    <div key={idx} className="grid-socket" aria-hidden="true" />
  ));

  return (
    <div className="board-wrapper">
      <div
        className="game-board-recessed"
        ref={boardRef}
        role="region"
        aria-label="2048 Game Board"
        tabIndex="0"
      >
        {/* Recessed background empty sockets */}
        <div className="grid-sockets-layer" aria-hidden="true">
          {socketCells}
        </div>

        {/* Dynamic 3D number cubes */}
        <div className="tiles-layer">
          {tiles.map((tile) => (
            <Tile key={tile.id} tile={tile} />
          ))}
        </div>

        {/* Win / Game Over Overlay */}
        <GameOverlay
          gameOver={gameOver}
          won={won}
          score={score}
          bestScore={bestScore}
          onRestart={onRestart}
          onContinue={onContinue}
          onUndo={onUndo}
          undosRemaining={undosRemaining}
          canUndo={canUndo}
        />
      </div>
    </div>
  );
};

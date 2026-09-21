import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createInitialGame,
  spawnTile,
  calculateMove,
  canMove,
  has2048Tile,
} from '../utils/gameLogic';
import { getSavedBestScore, saveBestScore } from '../utils/storage';
import {
  playSlideSound,
  playMergeSound,
  play2048Fanfare,
  playGameOverSound,
  getMuted,
  setMuted as setAudioMuted,
} from '../utils/sound';

export const useGame = () => {
  const [tiles, setTiles] = useState(() => createInitialGame());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => getSavedBestScore());
  const [scoreAddition, setScoreAddition] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [hasReached2048, setHasReached2048] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => getMuted());

  // Rule: Undo - 5 per game, preserves last 5 board states
  const [undosRemaining, setUndosRemaining] = useState(5);
  const [history, setHistory] = useState([]);

  // Refs for tracking authoritative latest state and preventing race conditions
  const tilesRef = useRef(tiles);
  const scoreRef = useRef(score);
  const bestScoreRef = useRef(bestScore);
  const gameOverRef = useRef(gameOver);
  const wonRef = useRef(won);
  const keepPlayingRef = useRef(keepPlaying);
  const hasReached2048Ref = useRef(hasReached2048);

  const pendingFinalMoveRef = useRef(null);
  const slideTimerRef = useRef(null);

  // Synchronize refs with state
  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    bestScoreRef.current = bestScore;
  }, [bestScore]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    wonRef.current = won;
  }, [won]);

  useEffect(() => {
    keepPlayingRef.current = keepPlaying;
  }, [keepPlaying]);

  useEffect(() => {
    hasReached2048Ref.current = hasReached2048;
  }, [hasReached2048]);

  // Clear score addition popup after animation duration
  useEffect(() => {
    if (scoreAddition) {
      const timer = setTimeout(() => {
        setScoreAddition(null);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [scoreAddition]);

  // Clean up any pending animation timer on unmount
  useEffect(() => {
    return () => {
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
      }
    };
  }, []);

  /**
   * Finalize a pending move immediately:
   * Commits the merge results to the authoritative board and spawns exactly one new tile.
   * @returns {Array} The completed board tiles
   */
  const flushPendingMove = useCallback(() => {
    if (!pendingFinalMoveRef.current) {
      return tilesRef.current;
    }

    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }

    const { finalTiles, scoreIncrease } = pendingFinalMoveRef.current;
    pendingFinalMoveRef.current = null;

    // Rule 4: Spawn exactly 1 new tile on empty cell after move resolves
    const { tiles: postSpawnTiles } = spawnTile(finalTiles);

    tilesRef.current = postSpawnTiles;
    setTiles(postSpawnTiles);

    // Update score and best score
    if (scoreIncrease > 0) {
      const newScore = scoreRef.current + scoreIncrease;
      scoreRef.current = newScore;
      setScore(newScore);

      if (newScore > bestScoreRef.current) {
        bestScoreRef.current = newScore;
        setBestScore(newScore);
        saveBestScore(newScore);
      }

      setScoreAddition({ amount: scoreIncrease, id: Date.now() });
      playMergeSound(scoreIncrease);
    }

    // Rule 5: Check 2048 win
    if (!hasReached2048Ref.current && has2048Tile(postSpawnTiles)) {
      hasReached2048Ref.current = true;
      setHasReached2048(true);
      wonRef.current = true;
      setWon(true);
      play2048Fanfare();
    }

    // Rule 6: Check Game Over (full board + no legal orthogonal moves)
    if (!canMove(postSpawnTiles)) {
      gameOverRef.current = true;
      setGameOver(true);
      playGameOverSound();
    }

    return postSpawnTiles;
  }, []);

  // Restart / New Game
  const restart = useCallback(() => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }
    pendingFinalMoveRef.current = null;

    const initial = createInitialGame();
    tilesRef.current = initial;
    setTiles(initial);

    scoreRef.current = 0;
    setScore(0);
    setScoreAddition(null);

    gameOverRef.current = false;
    setGameOver(false);

    wonRef.current = false;
    setWon(false);

    hasReached2048Ref.current = false;
    setHasReached2048(false);

    keepPlayingRef.current = false;
    setKeepPlaying(false);

    setUndosRemaining(5);
    setHistory([]);
  }, []);

  // Undo (Rule: 5 per game, restores exact previous state, works on Game Over)
  const undo = useCallback(() => {
    if (undosRemaining <= 0 || history.length === 0) return;

    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }
    pendingFinalMoveRef.current = null;

    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    const restoredTiles = previous.tiles.map((t) => ({
      ...t,
      isSliding: false,
      isNew: false,
      isMerged: false,
      isConsumed: false,
    }));

    tilesRef.current = restoredTiles;
    setTiles(restoredTiles);

    scoreRef.current = previous.score;
    setScore(previous.score);

    setUndosRemaining((prev) => Math.max(0, prev - 1));

    gameOverRef.current = false;
    setGameOver(false);

    wonRef.current = false;
    setWon(false);

    playSlideSound();
  }, [undosRemaining, history]);

  // Continue playing past 2048 (Rule 5: Keep Going)
  const continuePlaying = useCallback(() => {
    keepPlayingRef.current = true;
    setKeepPlaying(true);
    wonRef.current = false;
    setWon(false);
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setAudioMuted(next);
      return next;
    });
  }, []);

  // Move handler
  const move = useCallback(
    (direction) => {
      if (gameOverRef.current) return;
      if (wonRef.current && !keepPlayingRef.current) return;

      // 1. If an animation is active from a previous move, immediately commit it
      const currentBoard = flushPendingMove();

      // 2. Calculate the move on the authoritative, up-to-date board
      const {
        hasMoved,
        slidingTiles,
        finalTiles,
        scoreIncrease,
      } = calculateMove(currentBoard, direction);

      // Rule 4: A swipe that moves nothing is discarded
      if (!hasMoved) return;

      // 3. Save snapshot for Undo
      setHistory((prev) => [
        ...prev.slice(-4),
        { tiles: currentBoard, score: scoreRef.current },
      ]);

      // 4. Set pending move for finalization
      pendingFinalMoveRef.current = { finalTiles, scoreIncrease };

      // 5. Trigger slide sound and update state to slidingTiles for CSS animation
      playSlideSound();
      tilesRef.current = slidingTiles;
      setTiles(slidingTiles);

      // 6. Schedule finalization at the end of the slide transition (180ms)
      const SLIDE_DURATION_MS = 180;
      slideTimerRef.current = setTimeout(() => {
        flushPendingMove();
      }, SLIDE_DURATION_MS);
    },
    [flushPendingMove]
  );

  return {
    tiles,
    score,
    bestScore,
    scoreAddition,
    gameOver,
    won,
    keepPlaying,
    isMuted,
    undosRemaining,
    canUndo: undosRemaining > 0 && history.length > 0,
    move,
    undo,
    restart,
    continuePlaying,
    toggleSound,
  };
};

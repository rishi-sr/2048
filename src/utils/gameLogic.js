// 2048 Core Game Logic & Deterministic Board Engine

export const GRID_SIZE = 4;

let nextTileId = 1;

/**
 * Generate a permanent unique tile ID
 * Prioritizes crypto.randomUUID() when supported by the environment.
 */
export const createTileId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tile-${nextTileId++}-${Date.now().toString(36)}`;
};

/**
 * Reset tile ID counter (for tests)
 */
export const resetTileIdCounter = () => {
  nextTileId = 1;
};

/**
 * Get a 4x4 matrix representation from tiles array
 * @param {Array} tiles Array of { id, value, row, col }
 * @returns {Array<Array<Object|null>>}
 */
export const getBoardMatrix = (tiles) => {
  const matrix = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  for (const tile of tiles) {
    if (tile.row >= 0 && tile.row < GRID_SIZE && tile.col >= 0 && tile.col < GRID_SIZE) {
      matrix[tile.row][tile.col] = tile;
    }
  }
  return matrix;
};

/**
 * Find all empty { row, col } coordinates
 * @param {Array} tiles
 * @returns {Array<{row: number, col: number}>}
 */
export const getEmptyCoordinates = (tiles) => {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const empty = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
};

/**
 * Spawn a new random tile (90% chance of 2, 10% chance of 4)
 * @param {Array} tiles Current tiles
 * @returns {{ tiles: Array, newTile: Object|null }}
 */
export const spawnTile = (tiles) => {
  const emptyCoords = getEmptyCoordinates(tiles);
  if (emptyCoords.length === 0) return { tiles, newTile: null };

  const randomCoord = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newTile = {
    id: createTileId(),
    value,
    row: randomCoord.row,
    col: randomCoord.col,
    isNew: true,
    isMerged: false,
    isSliding: false,
    isConsumed: false,
  };

  return {
    tiles: [...tiles, newTile],
    newTile,
  };
};

/**
 * Create initial two tiles for a new game
 */
export const createInitialGame = () => {
  resetTileIdCounter();
  const first = spawnTile([]);
  const second = spawnTile(first.tiles);
  return second.tiles;
};

/**
 * Check if any legal moves remain (Rule 6: Full board & zero adjacent orthogonal matches)
 * @param {Array} tiles
 * @returns {boolean}
 */
export const canMove = (tiles) => {
  if (tiles.length < GRID_SIZE * GRID_SIZE) return true;

  const matrix = getBoardMatrix(tiles);

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const current = matrix[r][c];
      if (!current) return true;

      // Check right neighbor
      if (c < GRID_SIZE - 1) {
        const right = matrix[r][c + 1];
        if (right && right.value === current.value) return true;
      }

      // Check down neighbor
      if (r < GRID_SIZE - 1) {
        const down = matrix[r + 1][c];
        if (down && down.value === current.value) return true;
      }
    }
  }

  return false;
};

/**
 * Check if the board has achieved 2048 tile (Rule 5)
 * @param {Array} tiles
 * @returns {boolean}
 */
export const has2048Tile = (tiles) => {
  return tiles.some((t) => t.value >= 2048);
};

/**
 * Calculate move in specified direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'
 *
 * Guaranteed lifecycle:
 * 1. Identify destination (surviving) and consumed source tiles.
 * 2. In slidingTiles, both slide toward destination along their single axis.
 * 3. In finalTiles, consumed tile is removed; surviving tile keeps its permanent ID, updates value, and sets isMerged.
 * 4. Non-merging tiles update their coordinates and retain their permanent IDs.
 *
 * @param {Array} currentTiles
 * @param {'LEFT' | 'RIGHT' | 'UP' | 'DOWN'} direction
 * @returns {{
 *   hasMoved: boolean,
 *   slidingTiles: Array,
 *   finalTiles: Array,
 *   scoreIncrease: number
 * }}
 */
export const calculateMove = (currentTiles, direction) => {
  const slidingTiles = [];
  const finalTiles = [];
  let scoreIncrease = 0;
  let hasMoved = false;

  const processLine = (tilesInLine, targetStart, step, setCoords) => {
    let targetIndex = targetStart;
    let i = 0;

    while (i < tilesInLine.length) {
      const current = tilesInLine[i];
      const next = tilesInLine[i + 1];

      if (next && current.value === next.value) {
        // Destination tile is 'current' (closer to target wall)
        // Consumed tile is 'next' (slides into 'current')
        const survivingTarget = setCoords(current, targetIndex);
        const consumedTarget = setCoords(next, targetIndex);

        const currentSlid =
          current.row !== survivingTarget.row || current.col !== survivingTarget.col;
        const nextSlid =
          next.row !== consumedTarget.row || next.col !== consumedTarget.col;

        if (currentSlid || nextSlid) hasMoved = true;
        // Merge took place, move is always valid
        hasMoved = true;

        const mergedValue = current.value * 2;
        scoreIncrease += mergedValue;

        // Slide phase: both tiles visible, sliding to destination
        slidingTiles.push({
          ...survivingTarget,
          isSliding: currentSlid,
          isConsumed: false,
          isNew: false,
          isMerged: false,
        });
        slidingTiles.push({
          ...consumedTarget,
          isSliding: true,
          isConsumed: true,
          isNew: false,
          isMerged: false,
        });

        // Final phase: consumed tile removed. Surviving tile keeps original ID and doubles value!
        finalTiles.push({
          ...survivingTarget,
          value: mergedValue,
          isSliding: false,
          isConsumed: false,
          isNew: false,
          isMerged: true,
        });

        targetIndex += step;
        i += 2;
      } else {
        // Tile slides without merging
        const target = setCoords(current, targetIndex);
        const didSlide = current.row !== target.row || current.col !== target.col;
        if (didSlide) hasMoved = true;

        slidingTiles.push({
          ...target,
          isSliding: didSlide,
          isConsumed: false,
          isNew: false,
          isMerged: false,
        });

        finalTiles.push({
          ...target,
          isSliding: false,
          isConsumed: false,
          isNew: false,
          isMerged: false,
        });

        targetIndex += step;
        i += 1;
      }
    }
  };

  if (direction === 'LEFT') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const rowTiles = currentTiles
        .filter((t) => t.row === r && !t.isConsumed)
        .sort((a, b) => a.col - b.col);
      processLine(rowTiles, 0, 1, (t, targetCol) => ({ ...t, row: r, col: targetCol }));
    }
  } else if (direction === 'RIGHT') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const rowTiles = currentTiles
        .filter((t) => t.row === r && !t.isConsumed)
        .sort((a, b) => b.col - a.col);
      processLine(rowTiles, GRID_SIZE - 1, -1, (t, targetCol) => ({
        ...t,
        row: r,
        col: targetCol,
      }));
    }
  } else if (direction === 'UP') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const colTiles = currentTiles
        .filter((t) => t.col === c && !t.isConsumed)
        .sort((a, b) => a.row - b.row);
      processLine(colTiles, 0, 1, (t, targetRow) => ({ ...t, row: targetRow, col: c }));
    }
  } else if (direction === 'DOWN') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const colTiles = currentTiles
        .filter((t) => t.col === c && !t.isConsumed)
        .sort((a, b) => b.row - a.row);
      processLine(colTiles, GRID_SIZE - 1, -1, (t, targetRow) => ({
        ...t,
        row: targetRow,
        col: c,
      }));
    }
  }

  return {
    hasMoved,
    slidingTiles: hasMoved ? slidingTiles : currentTiles,
    finalTiles: hasMoved ? finalTiles : currentTiles,
    scoreIncrease,
  };
};

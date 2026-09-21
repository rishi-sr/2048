import React from 'react';

export const Tile = ({ tile }) => {
  const { value, row, col, isNew, isMerged, isSliding, isConsumed } = tile;

  // Determine digit length for responsive typography
  const digitCount = value.toString().length;
  let sizeClass = 'digits-1-2';
  if (digitCount === 3) {
    sizeClass = 'digits-3';
  } else if (digitCount === 4) {
    sizeClass = 'digits-4';
  } else if (digitCount >= 5) {
    sizeClass = 'digits-5';
  }

  // Value class (caps at 4096 for ultra-high scores)
  const valueClass = value <= 4096 ? `tile-${value}` : 'tile-super';

  const animationClass = isNew ? 'tile-spawn' : isMerged ? 'tile-merged' : '';
  const slidingClass = isSliding ? 'tile-sliding' : '';
  const consumedClass = isConsumed ? 'tile-consumed' : '';

  return (
    <div
      className={`tile-cube ${animationClass} ${slidingClass} ${consumedClass}`}
      style={{
        '--col': col,
        '--row': row,
      }}
      aria-label={`Tile ${value} at row ${row + 1}, column ${col + 1}`}
    >
      <div className={`tile-inner ${valueClass} ${sizeClass}`}>
        <span className="tile-face-content">{value}</span>
      </div>
    </div>
  );
};

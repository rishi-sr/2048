import { useEffect, useRef } from 'react';

/**
 * Hook for high-performance touch swipe, mouse drag & keyboard controls
 * Conforms to Rule 1: "Arrow keys, WASD, a mouse drag and a touch swipe all produce the same four moves"
 *
 * @param {Function} onMove Callback (direction: 'LEFT'|'RIGHT'|'UP'|'DOWN')
 * @param {React.RefObject} containerRef Target container ref for touch and mouse gestures
 * @param {boolean} disabled Whether gestures are temporarily disabled
 * @param {Function} onUndo Optional callback when undo key is pressed
 */
export const useSwipe = (onMove, containerRef, disabled = false, onUndo = null) => {
  const touchStartRef = useRef(null);
  const mouseStartRef = useRef(null);
  const isMovingRef = useRef(false);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container || disabled) return;

    // --- Touch Handlers ---
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      isMovingRef.current = true;
    };

    const handleTouchMove = (e) => {
      if (!isMovingRef.current || !touchStartRef.current) return;
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (!isMovingRef.current || !touchStartRef.current) return;
      isMovingRef.current = false;

      const touch = e.changedTouches[0];
      if (!touch) return;

      processGesture(
        touchStartRef.current.x,
        touchStartRef.current.y,
        touch.clientX,
        touch.clientY,
        Date.now() - touchStartRef.current.time
      );

      touchStartRef.current = null;
    };

    const handleTouchCancel = () => {
      touchStartRef.current = null;
      isMovingRef.current = false;
    };

    // --- Mouse Drag Handlers (Rule 1: mouse drag produces same moves) ---
    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Left click only
      mouseStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };
    };

    const handleMouseUp = (e) => {
      if (!mouseStartRef.current) return;

      processGesture(
        mouseStartRef.current.x,
        mouseStartRef.current.y,
        e.clientX,
        e.clientY,
        Date.now() - mouseStartRef.current.time
      );

      mouseStartRef.current = null;
    };

    // Helper: calculate swipe vector and fire dominant orthogonal direction
    const processGesture = (startX, startY, endX, endY, deltaTime) => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      const MIN_DISTANCE = 22; // Travel threshold in px

      if ((absX > MIN_DISTANCE || absY > MIN_DISTANCE) && deltaTime < 1200) {
        if (absX > absY) {
          // Horizontal dominant
          if (deltaX > 0) {
            onMove('RIGHT');
          } else {
            onMove('LEFT');
          }
        } else {
          // Vertical dominant
          if (deltaY > 0) {
            onMove('DOWN');
          } else {
            onMove('UP');
          }
        }
      }
    };

    // Touch listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    // Mouse drag listeners
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);

      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef, onMove, disabled]);

  // Keyboard support for Arrow keys, WASD, and Undo shortcut
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      // Check undo shortcut
      if (
        onUndo &&
        (e.key === 'u' ||
          e.key === 'U' ||
          e.key === 'Backspace' ||
          ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')))
      ) {
        e.preventDefault();
        onUndo();
        return;
      }

      let direction = null;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'RIGHT';
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'DOWN';
          break;
        default:
          return;
      }

      e.preventDefault();
      onMove(direction);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, onUndo, disabled]);
};

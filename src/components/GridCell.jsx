/**
 * GridCell Component
 *
 * Renders a single cell in the 4×4 Wumpus World grid.
 * Shows appropriate icons and visual effects based on cell state.
 */

import { useMemo } from 'react';
import { CELL, PERCEPT, GRID_SIZE } from '../gameEngine';

export default function GridCell({
  row,
  col,
  cell,
  isPlayer,
  isVisited,
  isStart,
  gameOver,
  hasGold,
}) {
  // Only reveal cell contents if visited or game is over
  const revealed = isVisited || gameOver;

  // Determine cell CSS classes
  const cellClasses = useMemo(() => {
    let classes = 'cell relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ';

    if (isPlayer) {
      classes += 'cell-current ';
    } else if (isVisited) {
      classes += 'cell-visited ';
    } else {
      classes += 'bg-cave-800/50 border-glass-border ';
    }

    if (gameOver && !isVisited) {
      classes += 'opacity-80 ';
    }

    return classes;
  }, [isPlayer, isVisited, gameOver]);

  // Build the content icons
  const renderContent = () => {
    const icons = [];

    // Player icon
    if (isPlayer) {
      icons.push(
        <span key="player" className="text-2xl sm:text-3xl animate-float z-10" role="img" aria-label="Player">
          🧙
        </span>
      );
    }

    // Cell content (only if revealed)
    if (revealed && !isPlayer) {
      if (cell.content === CELL.WUMPUS) {
        icons.push(
          <span key="wumpus" className="text-2xl sm:text-3xl" role="img" aria-label="Wumpus">
            👹
          </span>
        );
      } else if (cell.content === CELL.PIT) {
        icons.push(
          <span key="pit" className="text-2xl sm:text-3xl" role="img" aria-label="Pit">
            🕳️
          </span>
        );
      } else if (cell.content === CELL.GOLD) {
        icons.push(
          <span key="gold" className="text-2xl sm:text-3xl animate-gold-sparkle" role="img" aria-label="Gold">
            💎
          </span>
        );
      }
    }

    // Also show content when player is on the cell (for wumpus/pit on death)
    if (isPlayer && gameOver && cell.content === CELL.WUMPUS) {
      icons.push(
        <span key="wumpus-death" className="text-lg absolute top-0 right-1" role="img" aria-label="Wumpus">
          👹
        </span>
      );
    }
    if (isPlayer && gameOver && cell.content === CELL.PIT) {
      icons.push(
        <span key="pit-death" className="text-lg absolute top-0 right-1" role="img" aria-label="Pit">
          🕳️
        </span>
      );
    }

    // Percept icons (only when visited and not game over reveal of unvisited)
    if (isVisited && !gameOver) {
      const percepts = [];
      if (cell.percepts.has(PERCEPT.BREEZE)) {
        percepts.push(
          <span key="breeze" className="text-xs sm:text-sm opacity-80" title="Breeze - Pit nearby!">
            💨
          </span>
        );
      }
      if (cell.percepts.has(PERCEPT.STENCH)) {
        percepts.push(
          <span key="stench" className="text-xs sm:text-sm opacity-80" title="Stench - Wumpus nearby!">
            😷
          </span>
        );
      }
      if (cell.percepts.has(PERCEPT.GLITTER) && !hasGold) {
        percepts.push(
          <span key="glitter" className="text-xs sm:text-sm animate-gold-sparkle" title="Glitter - Gold here!">
            ✨
          </span>
        );
      }
      if (percepts.length > 0) {
        icons.push(
          <div key="percepts" className="flex gap-0.5 absolute bottom-1">
            {percepts}
          </div>
        );
      }
    }

    // Show percepts on game over for revealed cells
    if (gameOver && revealed && !isPlayer) {
      const percepts = [];
      if (cell.percepts.has(PERCEPT.BREEZE)) {
        percepts.push(<span key="breeze" className="text-xs opacity-60">💨</span>);
      }
      if (cell.percepts.has(PERCEPT.STENCH)) {
        percepts.push(<span key="stench" className="text-xs opacity-60">😷</span>);
      }
      if (percepts.length > 0) {
        icons.push(
          <div key="percepts-go" className="flex gap-0.5 absolute bottom-1">
            {percepts}
          </div>
        );
      }
    }

    // Start marker
    if (isStart && icons.length === 0) {
      icons.push(
        <span key="start" className="text-xs text-accent-emerald/60 font-medium">
          START
        </span>
      );
    }

    // Fog of war for unvisited cells (when not game over)
    if (!revealed) {
      icons.push(
        <span key="fog" className="text-xl sm:text-2xl opacity-30">
          ❓
        </span>
      );
    }

    return icons;
  };

  return (
    <div className={cellClasses} data-row={row} data-col={col}>
      {renderContent()}
      {/* Coordinate label */}
      <span className="absolute top-0.5 left-1 text-[0.6rem] text-white/20 font-mono">
        {row},{col}
      </span>
    </div>
  );
}

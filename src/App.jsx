/**
 * App.jsx — Wumpus World Main Application
 *
 * Orchestrates the game state, keyboard controls, sound effects,
 * and renders the complete UI with grid, stats, controls, and modals.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createInitialState,
  movePlayer,
  shootArrow,
  grabGold,
  climbOut,
  GRID_SIZE,
  STATUS,
  CELL,
  PERCEPT,
} from './gameEngine';
import {
  playMoveSound,
  playBumpSound,
  playShootSound,
  playHitSound,
  playDeathSound,
  playGrabGoldSound,
  playWinSound,
  playPerceptSound,
} from './sounds';
import GridCell from './components/GridCell';
import GameStats from './components/GameStats';
import Controls from './components/Controls';
import Instructions from './components/Instructions';
import GameModal from './components/GameModal';

export default function App() {
  const [gameState, setGameState] = useState(() => createInitialState());
  const [shootMode, setShootMode] = useState(false);
  const [shakeGrid, setShakeGrid] = useState(false);
  const gridRef = useRef(null);

  // ===== Sound effect dispatcher =====
  const playSoundForAction = useCallback((newState, oldState) => {
    switch (newState.lastAction) {
      case 'move':
        playMoveSound();
        // Play percept sound if new cell has percepts
        if (newState.board[newState.playerRow][newState.playerCol].percepts.size > 0) {
          setTimeout(playPerceptSound, 150);
        }
        break;
      case 'bump':
        playBumpSound();
        break;
      case 'shoot_hit':
        playShootSound();
        setTimeout(playHitSound, 300);
        break;
      case 'shoot_miss':
        playShootSound();
        break;
      case 'death_wumpus':
      case 'death_pit':
        playDeathSound();
        break;
      case 'grab_gold':
        playGrabGoldSound();
        break;
      case 'win':
        playWinSound();
        break;
    }
  }, []);

  // ===== Screen shake effect =====
  const triggerShake = useCallback(() => {
    setShakeGrid(true);
    setTimeout(() => setShakeGrid(false), 500);
  }, []);

  // ===== Action handlers =====
  const handleMove = useCallback(
    (direction) => {
      setGameState((prev) => {
        const next = movePlayer(prev, direction);
        playSoundForAction(next, prev);
        if (next.lastAction === 'bump' || next.lastAction?.startsWith('death')) {
          triggerShake();
        }
        return next;
      });
    },
    [playSoundForAction, triggerShake]
  );

  const handleShoot = useCallback(
    (direction) => {
      setGameState((prev) => {
        if (!prev.hasArrow) return prev;
        const next = shootArrow(prev, direction);
        playSoundForAction(next, prev);
        setShootMode(false);
        if (next.lastAction === 'shoot_hit') {
          triggerShake();
        }
        return next;
      });
    },
    [playSoundForAction, triggerShake]
  );

  const handleGrab = useCallback(() => {
    setGameState((prev) => {
      const next = grabGold(prev);
      playSoundForAction(next, prev);
      return next;
    });
  }, [playSoundForAction]);

  const handleClimb = useCallback(() => {
    setGameState((prev) => {
      const next = climbOut(prev);
      playSoundForAction(next, prev);
      return next;
    });
  }, [playSoundForAction]);

  const handleRestart = useCallback(() => {
    setGameState(createInitialState());
    setShootMode(false);
  }, []);

  // ===== Keyboard controls =====
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState.status !== STATUS.PLAYING) {
        // Allow restart on Enter when game is over
        if (e.key === 'Enter') {
          handleRestart();
        }
        return;
      }

      const isShift = e.shiftKey;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          isShift ? handleShoot('UP') : handleMove('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          isShift ? handleShoot('DOWN') : handleMove('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          isShift ? handleShoot('LEFT') : handleMove('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          isShift ? handleShoot('RIGHT') : handleMove('RIGHT');
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          handleGrab();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          handleClimb();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, handleMove, handleShoot, handleGrab, handleClimb, handleRestart]);

  // ===== Determine game-over state =====
  const gameOver = gameState.status !== STATUS.PLAYING;

  // ===== Message bar color =====
  const getMessageColor = () => {
    if (gameOver && gameState.status === STATUS.WON) return 'border-accent-emerald/40 bg-accent-emerald/5';
    if (gameOver) return 'border-accent-red/40 bg-accent-red/5';
    if (gameState.lastAction === 'grab_gold') return 'border-accent-amber/40 bg-accent-amber/5';
    if (gameState.lastAction === 'shoot_hit') return 'border-accent-cyan/40 bg-accent-cyan/5';
    return 'border-glass-border bg-glass-white';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== Header ===== */}
      <header className="glass-card mx-3 sm:mx-6 mt-3 sm:mt-4 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl">🐉</span>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-cyan bg-clip-text text-transparent">
              Wumpus World
            </h1>
            <p className="text-xs text-white/40 hidden sm:block">
              A Dark Fantasy Adventure
            </p>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="btn-secondary text-sm flex items-center gap-2"
          id="restart-btn"
        >
          🔄 New Game
        </button>
      </header>

      {/* ===== Message Bar ===== */}
      <div className={`mx-3 sm:mx-6 mt-3 px-4 py-3 rounded-xl border transition-all duration-300 ${getMessageColor()}`}>
        <p className="text-sm sm:text-base text-white/80 text-center font-medium" id="game-message">
          {gameState.message}
        </p>
      </div>

      {/* ===== Main Content ===== */}
      <main className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Left Sidebar — Stats & Instructions (on large screens) */}
        <aside className="lg:w-72 xl:w-80 flex flex-col gap-3 sm:gap-4 order-2 lg:order-1">
          <GameStats state={gameState} />
          <Instructions />
        </aside>

        {/* Center — Game Grid */}
        <section className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2">
          <div
            ref={gridRef}
            className={`glass-card p-3 sm:p-5 w-full max-w-md lg:max-w-lg ${
              shakeGrid ? 'animate-shake' : ''
            }`}
          >
            {/* Grid Label */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/30 font-mono uppercase tracking-widest">
                Cave Map
              </span>
              <span className="text-xs text-white/20 font-mono">
                {GRID_SIZE}×{GRID_SIZE}
              </span>
            </div>

            {/* The Grid */}
            <div
              className="grid gap-1.5 sm:gap-2"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
              id="game-grid"
            >
              {gameState.board.map((row, rowIdx) =>
                row.map((cell, colIdx) => (
                  <GridCell
                    key={`${rowIdx}-${colIdx}`}
                    row={rowIdx}
                    col={colIdx}
                    cell={cell}
                    isPlayer={rowIdx === gameState.playerRow && colIdx === gameState.playerCol}
                    isVisited={gameState.visited.has(`${rowIdx},${colIdx}`)}
                    isStart={rowIdx === GRID_SIZE - 1 && colIdx === 0}
                    gameOver={gameOver}
                    hasGold={gameState.hasGold}
                  />
                ))
              )}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 justify-center">
              {[
                ['🧙', 'You'],
                ['👹', 'Wumpus'],
                ['🕳️', 'Pit'],
                ['💎', 'Gold'],
                ['😷', 'Stench'],
                ['💨', 'Breeze'],
                ['✨', 'Glitter'],
              ].map(([icon, label]) => (
                <span key={label} className="text-xs text-white/30 flex items-center gap-1">
                  <span className="text-sm">{icon}</span> {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Right Sidebar — Controls */}
        <aside className="lg:w-72 xl:w-80 order-3">
          <Controls
            state={gameState}
            onMove={handleMove}
            onShoot={handleShoot}
            onGrab={handleGrab}
            onClimb={handleClimb}
            shootMode={shootMode}
            setShootMode={setShootMode}
          />

          {/* Keyboard Hint */}
          <div className="glass-card p-3 mt-3 sm:mt-4 animate-fade-in-up">
            <p className="text-xs text-white/30 text-center leading-relaxed">
              ⌨️ <span className="text-white/50">WASD</span> or <span className="text-white/50">Arrows</span> to move
              &nbsp;·&nbsp;
              <span className="text-white/50">Shift</span>+Direction to shoot
              &nbsp;·&nbsp;
              <span className="text-white/50">G</span> grab
              &nbsp;·&nbsp;
              <span className="text-white/50">C</span> climb
            </p>
          </div>
        </aside>
      </main>

      {/* ===== Footer ===== */}
      <footer className="text-center text-xs text-white/20 py-3">
        Wumpus World — Built with React + Vite + Tailwind CSS
      </footer>

      {/* ===== Win/Loss Modal ===== */}
      <GameModal state={gameState} onRestart={handleRestart} />
    </div>
  );
}

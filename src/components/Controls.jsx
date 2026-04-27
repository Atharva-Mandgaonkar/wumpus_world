/**
 * Controls Component
 *
 * Renders directional movement buttons, shoot buttons,
 * grab gold, and climb out action buttons.
 */

import { STATUS, GRID_SIZE } from '../gameEngine';

export default function Controls({
  state,
  onMove,
  onShoot,
  onGrab,
  onClimb,
  shootMode,
  setShootMode,
}) {
  const disabled = state.status !== STATUS.PLAYING;
  const isAtStart = state.playerRow === GRID_SIZE - 1 && state.playerCol === 0;

  return (
    <div className="glass-card p-4 sm:p-5 animate-fade-in-up">
      <h2 className="font-display text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
        <span className="text-accent-indigo">🎮</span> Controls
      </h2>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShootMode(false)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            !shootMode
              ? 'bg-accent-purple/20 border border-accent-purple/50 text-accent-purple'
              : 'bg-cave-800/40 border border-glass-border/50 text-white/50 hover:text-white/70'
          }`}
          disabled={disabled}
          id="mode-move"
        >
          🚶 Move
        </button>
        <button
          onClick={() => setShootMode(true)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            shootMode
              ? 'bg-accent-rose/20 border border-accent-rose/50 text-accent-rose'
              : 'bg-cave-800/40 border border-glass-border/50 text-white/50 hover:text-white/70'
          } ${!state.hasArrow ? 'opacity-40 cursor-not-allowed' : ''}`}
          disabled={disabled || !state.hasArrow}
          id="mode-shoot"
        >
          🏹 Shoot {!state.hasArrow && '(Used)'}
        </button>
      </div>

      {/* D-pad */}
      <div className="flex flex-col items-center gap-1.5 mb-4">
        {/* Up */}
        <button
          className="dir-btn"
          onClick={() => (shootMode ? onShoot('UP') : onMove('UP'))}
          disabled={disabled}
          id="btn-up"
          title={shootMode ? 'Shoot Up' : 'Move Up'}
        >
          ↑
        </button>
        {/* Left, Center, Right */}
        <div className="flex gap-1.5">
          <button
            className="dir-btn"
            onClick={() => (shootMode ? onShoot('LEFT') : onMove('LEFT'))}
            disabled={disabled}
            id="btn-left"
            title={shootMode ? 'Shoot Left' : 'Move Left'}
          >
            ←
          </button>
          <div className="dir-btn bg-cave-800/60 border-cave-600 cursor-default text-xs text-white/30 font-mono">
            {shootMode ? '🎯' : '🧙'}
          </div>
          <button
            className="dir-btn"
            onClick={() => (shootMode ? onShoot('RIGHT') : onMove('RIGHT'))}
            disabled={disabled}
            id="btn-right"
            title={shootMode ? 'Shoot Right' : 'Move Right'}
          >
            →
          </button>
        </div>
        {/* Down */}
        <button
          className="dir-btn"
          onClick={() => (shootMode ? onShoot('DOWN') : onMove('DOWN'))}
          disabled={disabled}
          id="btn-down"
          title={shootMode ? 'Shoot Down' : 'Move Down'}
        >
          ↓
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onGrab}
          disabled={disabled}
          className="btn-secondary flex-1 text-sm"
          id="btn-grab"
        >
          ✊ Grab
        </button>
        <button
          onClick={onClimb}
          disabled={disabled || !isAtStart}
          className={`btn-secondary flex-1 text-sm ${
            isAtStart && state.hasGold ? 'border-accent-emerald/50 text-accent-emerald animate-pulse-glow' : ''
          }`}
          id="btn-climb"
        >
          🪜 Climb Out
        </button>
      </div>
    </div>
  );
}

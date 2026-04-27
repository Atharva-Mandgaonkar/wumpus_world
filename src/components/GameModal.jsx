/**
 * GameModal Component
 *
 * Shows a win/loss modal overlay with game results and restart button.
 */

import { STATUS } from '../gameEngine';

export default function GameModal({ state, onRestart }) {
  if (state.status === STATUS.PLAYING) return null;

  const isWin = state.status === STATUS.WON;

  return (
    <div className="modal-overlay" id="game-modal">
      <div className="glass-card p-6 sm:p-8 max-w-md w-full animate-bounce-in text-center">
        {/* Icon */}
        <div className="text-6xl sm:text-7xl mb-4">
          {isWin ? '🏆' : '💀'}
        </div>

        {/* Title */}
        <h2 className={`font-display text-2xl sm:text-3xl font-bold mb-2 ${
          isWin ? 'text-accent-amber' : 'text-accent-rose'
        }`}>
          {isWin ? 'VICTORY!' : 'GAME OVER'}
        </h2>

        {/* Subtitle */}
        <p className="text-white/60 text-sm sm:text-base mb-6">
          {state.status === STATUS.WON && 'You escaped the cave with the gold!'}
          {state.status === STATUS.DEAD_WUMPUS && 'The Wumpus found its next meal...'}
          {state.status === STATUS.DEAD_PIT && 'You fell into a bottomless abyss...'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatBox
            label="Final Score"
            value={state.score}
            color={state.score >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}
          />
          <StatBox
            label="Moves"
            value={state.moveCount}
            color="text-accent-cyan"
          />
          <StatBox
            label="Gold"
            value={state.hasGold ? 'Yes' : 'No'}
            color={state.hasGold ? 'text-accent-amber' : 'text-white/40'}
          />
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="btn-primary w-full text-base py-3"
          id="restart-modal-btn"
        >
          ⚔ Play Again
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-cave-800/50 rounded-lg p-3 border border-glass-border/40">
      <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}

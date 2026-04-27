/**
 * GameStats Component
 *
 * Displays the player's current game statistics in a glass card panel.
 * Shows score, arrow status, gold collected, move count, and game status.
 */

import { STATUS } from '../gameEngine';

export default function GameStats({ state }) {
  const statusConfig = {
    [STATUS.PLAYING]: { label: 'Exploring', color: 'text-accent-cyan', icon: '🔍' },
    [STATUS.WON]: { label: 'Victory!', color: 'text-accent-emerald', icon: '🏆' },
    [STATUS.DEAD_WUMPUS]: { label: 'Devoured', color: 'text-accent-red', icon: '💀' },
    [STATUS.DEAD_PIT]: { label: 'Fallen', color: 'text-accent-red', icon: '💀' },
  };

  const currentStatus = statusConfig[state.status];

  const stats = [
    {
      label: 'Score',
      value: state.score,
      icon: '📊',
      color: state.score >= 0 ? 'text-accent-emerald' : 'text-accent-rose',
    },
    {
      label: 'Arrow',
      value: state.hasArrow ? 'Ready' : 'Used',
      icon: state.hasArrow ? '🏹' : '❌',
      color: state.hasArrow ? 'text-accent-amber' : 'text-white/40',
    },
    {
      label: 'Gold',
      value: state.hasGold ? 'Collected' : 'Not Found',
      icon: state.hasGold ? '💰' : '🔎',
      color: state.hasGold ? 'text-accent-amber' : 'text-white/40',
    },
    {
      label: 'Moves',
      value: state.moveCount,
      icon: '👣',
      color: 'text-accent-purple',
    },
    {
      label: 'Wumpus',
      value: state.wumpusAlive ? 'Alive' : 'Dead',
      icon: state.wumpusAlive ? '👹' : '☠️',
      color: state.wumpusAlive ? 'text-accent-rose' : 'text-accent-emerald',
    },
    {
      label: 'Status',
      value: currentStatus.label,
      icon: currentStatus.icon,
      color: currentStatus.color,
    },
  ];

  return (
    <div className="glass-card p-4 sm:p-5 animate-fade-in-up">
      <h2 className="font-display text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
        <span className="text-accent-purple">⚔</span> Game Stats
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-cave-800/40 rounded-lg p-3 border border-glass-border/50 hover:border-accent-purple/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{stat.icon}</span>
              <span className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className={`text-sm font-semibold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

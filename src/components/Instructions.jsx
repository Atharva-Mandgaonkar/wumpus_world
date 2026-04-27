/**
 * Instructions Component
 *
 * Displays game instructions and controls in a collapsible panel.
 */

import { useState } from 'react';

export default function Instructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-card p-4 sm:p-5 animate-fade-in-up">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
        id="instructions-toggle"
      >
        <h2 className="font-display text-lg font-bold text-white/90 flex items-center gap-2">
          <span className="text-accent-cyan">📜</span> Instructions
        </h2>
        <span className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-3 text-sm text-white/70">
          <Section title="🎯 Objective">
            Navigate the cave, find the gold 💎, and return to the entrance (bottom-left) alive!
          </Section>

          <Section title="⚠️ Dangers">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Wumpus 👹</strong> — A terrible beast. Step on it and you die!</li>
              <li><strong>Pits 🕳️</strong> — Bottomless pits. Fall in and it's game over!</li>
            </ul>
          </Section>

          <Section title="🔮 Percepts">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Stench 😷</strong> — The Wumpus is in an adjacent cell</li>
              <li><strong>Breeze 💨</strong> — A pit is in an adjacent cell</li>
              <li><strong>Glitter ✨</strong> — Gold is in the current cell</li>
            </ul>
          </Section>

          <Section title="🎮 Controls">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Arrow Keys / WASD</strong> — Move the player</li>
              <li><strong>Shift + Direction</strong> — Shoot arrow</li>
              <li><strong>G</strong> — Grab gold</li>
              <li><strong>C</strong> — Climb out (at entrance)</li>
              <li>Or use the on-screen buttons</li>
            </ul>
          </Section>

          <Section title="📊 Scoring">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Each move: <span className="text-accent-rose">-1</span></li>
              <li>Shoot arrow: <span className="text-accent-rose">-10</span></li>
              <li>Kill Wumpus: <span className="text-accent-emerald">+200</span></li>
              <li>Grab gold: <span className="text-accent-emerald">+100</span></li>
              <li>Escape with gold: <span className="text-accent-emerald">+1000</span></li>
              <li>Death: <span className="text-accent-rose">-1000</span></li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-cave-800/30 rounded-lg p-3 border border-glass-border/30">
      <h3 className="font-semibold text-white/80 mb-1.5">{title}</h3>
      <div className="text-white/60 leading-relaxed">{children}</div>
    </div>
  );
}

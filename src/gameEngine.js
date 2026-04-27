/**
 * Wumpus World Game Engine
 *
 * Handles all game state, board generation, movement, shooting,
 * and score calculations for a 4×4 Wumpus World grid.
 */

// Grid dimensions
export const GRID_SIZE = 4;

// Cell content types
export const CELL = {
  EMPTY: 'empty',
  WUMPUS: 'wumpus',
  PIT: 'pit',
  GOLD: 'gold',
};

// Percept types
export const PERCEPT = {
  STENCH: 'stench',
  BREEZE: 'breeze',
  GLITTER: 'glitter',
};

// Game status
export const STATUS = {
  PLAYING: 'playing',
  WON: 'won',
  DEAD_WUMPUS: 'dead_wumpus',
  DEAD_PIT: 'dead_pit',
};

// Direction vectors: [rowDelta, colDelta]
export const DIRECTIONS = {
  UP: [-1, 0],
  DOWN: [1, 0],
  LEFT: [0, -1],
  RIGHT: [0, 1],
};

// Score values
const SCORES = {
  MOVE: -1,
  SHOOT: -10,
  DEATH: -1000,
  GOLD_PICKUP: 100,
  WIN: 1000,
  WUMPUS_KILL: 200,
};

/**
 * Returns the neighbors of a cell (up/down/left/right).
 */
function getNeighbors(row, col) {
  const neighbors = [];
  for (const [dr, dc] of Object.values(DIRECTIONS)) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

/**
 * Creates a fresh board with random placement of Wumpus, Gold, and Pits.
 * Player starts at bottom-left (row=3, col=0).
 * Ensures Wumpus, Gold, and Pits are not on the start cell.
 */
export function createBoard() {
  // Initialize empty board
  const board = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      content: CELL.EMPTY,
      percepts: new Set(),
    }))
  );

  const startRow = GRID_SIZE - 1;
  const startCol = 0;

  // Helper: get a random cell that is NOT the start cell and not already occupied
  function getRandomCell(occupied) {
    let r, c;
    do {
      r = Math.floor(Math.random() * GRID_SIZE);
      c = Math.floor(Math.random() * GRID_SIZE);
    } while (
      (r === startRow && c === startCol) ||
      occupied.some(([or, oc]) => or === r && oc === c)
    );
    return [r, c];
  }

  const occupied = [];

  // Place Wumpus
  const [wr, wc] = getRandomCell(occupied);
  board[wr][wc].content = CELL.WUMPUS;
  occupied.push([wr, wc]);

  // Place Gold
  const [gr, gc] = getRandomCell(occupied);
  board[gr][gc].content = CELL.GOLD;
  occupied.push([gr, gc]);

  // Place 2-3 Pits randomly
  const numPits = 2 + Math.floor(Math.random() * 2); // 2 or 3
  for (let i = 0; i < numPits; i++) {
    const [pr, pc] = getRandomCell(occupied);
    board[pr][pc].content = CELL.PIT;
    occupied.push([pr, pc]);
  }

  // Calculate percepts
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = board[r][c];

      if (cell.content === CELL.WUMPUS) {
        // Add stench to neighbors
        for (const [nr, nc] of getNeighbors(r, c)) {
          board[nr][nc].percepts.add(PERCEPT.STENCH);
        }
      }

      if (cell.content === CELL.PIT) {
        // Add breeze to neighbors
        for (const [nr, nc] of getNeighbors(r, c)) {
          board[nr][nc].percepts.add(PERCEPT.BREEZE);
        }
      }

      if (cell.content === CELL.GOLD) {
        // Glitter on the same cell
        cell.percepts.add(PERCEPT.GLITTER);
      }
    }
  }

  return board;
}

/**
 * Creates the initial game state.
 */
export function createInitialState() {
  const board = createBoard();
  const startRow = GRID_SIZE - 1;
  const startCol = 0;

  return {
    board,
    playerRow: startRow,
    playerCol: startCol,
    hasArrow: true,
    hasGold: false,
    wumpusAlive: true,
    score: 0,
    status: STATUS.PLAYING,
    visited: new Set([`${startRow},${startCol}`]),
    message: '🗺️ You enter the cave... Beware of the Wumpus!',
    moveCount: 0,
    lastAction: null,
  };
}

/**
 * Move the player in a direction. Returns a new state.
 */
export function movePlayer(state, direction) {
  if (state.status !== STATUS.PLAYING) return state;

  const [dr, dc] = DIRECTIONS[direction];
  const newRow = state.playerRow + dr;
  const newCol = state.playerCol + dc;

  // Bounds check
  if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
    return {
      ...state,
      message: '🚫 You bump into a wall!',
      lastAction: 'bump',
    };
  }

  const newVisited = new Set(state.visited);
  newVisited.add(`${newRow},${newCol}`);

  let newScore = state.score + SCORES.MOVE;
  let newStatus = state.status;
  let message = '';
  let lastAction = 'move';

  const cell = state.board[newRow][newCol];

  // Check for death
  if (cell.content === CELL.WUMPUS && state.wumpusAlive) {
    newScore += SCORES.DEATH;
    newStatus = STATUS.DEAD_WUMPUS;
    message = '💀 The Wumpus devours you! Game Over!';
    lastAction = 'death_wumpus';
  } else if (cell.content === CELL.PIT) {
    newScore += SCORES.DEATH;
    newStatus = STATUS.DEAD_PIT;
    message = '💀 You fell into a bottomless pit! Game Over!';
    lastAction = 'death_pit';
  } else {
    // Build percept messages
    const percepts = [];
    if (cell.percepts.has(PERCEPT.STENCH)) percepts.push('😷 You smell a terrible stench...');
    if (cell.percepts.has(PERCEPT.BREEZE)) percepts.push('💨 You feel a breeze...');
    if (cell.percepts.has(PERCEPT.GLITTER) && !state.hasGold) percepts.push('✨ Something glitters here!');

    if (percepts.length > 0) {
      message = percepts.join(' ');
    } else {
      message = '🚶 You move cautiously through the cave...';
    }
  }

  return {
    ...state,
    playerRow: newRow,
    playerCol: newCol,
    score: newScore,
    status: newStatus,
    visited: newVisited,
    message,
    moveCount: state.moveCount + 1,
    lastAction,
  };
}

/**
 * Shoot an arrow in a direction. Returns a new state.
 */
export function shootArrow(state, direction) {
  if (state.status !== STATUS.PLAYING || !state.hasArrow) return state;

  const [dr, dc] = DIRECTIONS[direction];
  let newScore = state.score + SCORES.SHOOT;
  let wumpusAlive = state.wumpusAlive;
  let message = '';
  let lastAction = 'shoot_miss';

  // The arrow travels in a straight line
  let r = state.playerRow + dr;
  let c = state.playerCol + dc;
  let hit = false;

  while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
    if (state.board[r][c].content === CELL.WUMPUS) {
      hit = true;
      break;
    }
    r += dr;
    c += dc;
  }

  if (hit) {
    wumpusAlive = false;
    newScore += SCORES.WUMPUS_KILL;
    message = '🎯 You hear a terrifying scream! The Wumpus is dead!';
    lastAction = 'shoot_hit';

    // Remove wumpus from board (create new board to avoid mutation)
    const newBoard = state.board.map(row =>
      row.map(cell => ({ ...cell, percepts: new Set(cell.percepts) }))
    );
    newBoard[r][c] = { ...newBoard[r][c], content: CELL.EMPTY };

    // Remove stench from neighbors
    for (const [nr, nc] of getNeighbors(r, c)) {
      newBoard[nr][nc].percepts.delete(PERCEPT.STENCH);
    }

    return {
      ...state,
      board: newBoard,
      hasArrow: false,
      wumpusAlive: false,
      score: newScore,
      message,
      lastAction,
    };
  } else {
    message = '🏹 Your arrow flies into the darkness... Nothing happened.';
  }

  return {
    ...state,
    hasArrow: false,
    wumpusAlive,
    score: newScore,
    message,
    lastAction,
  };
}

/**
 * Pick up gold from the current cell. Returns a new state.
 */
export function grabGold(state) {
  if (state.status !== STATUS.PLAYING) return state;

  const cell = state.board[state.playerRow][state.playerCol];

  if (cell.content === CELL.GOLD && !state.hasGold) {
    const newBoard = state.board.map(row =>
      row.map(c => ({ ...c, percepts: new Set(c.percepts) }))
    );
    newBoard[state.playerRow][state.playerCol] = {
      ...newBoard[state.playerRow][state.playerCol],
      content: CELL.EMPTY,
      percepts: new Set(),
    };
    // Remove glitter
    newBoard[state.playerRow][state.playerCol].percepts.delete(PERCEPT.GLITTER);

    return {
      ...state,
      board: newBoard,
      hasGold: true,
      score: state.score + SCORES.GOLD_PICKUP,
      message: '💰 You grabbed the gold! Now escape through the entrance!',
      lastAction: 'grab_gold',
    };
  }

  return {
    ...state,
    message: '🤷 Nothing to grab here...',
    lastAction: 'grab_empty',
  };
}

/**
 * Attempt to climb out of the cave. Returns a new state.
 */
export function climbOut(state) {
  if (state.status !== STATUS.PLAYING) return state;

  const startRow = GRID_SIZE - 1;
  const startCol = 0;

  if (state.playerRow === startRow && state.playerCol === startCol) {
    if (state.hasGold) {
      return {
        ...state,
        score: state.score + SCORES.WIN,
        status: STATUS.WON,
        message: '🏆 You escaped with the gold! You WIN!',
        lastAction: 'win',
      };
    } else {
      return {
        ...state,
        message: '🚪 You could leave, but you haven\'t found the gold yet!',
        lastAction: 'climb_no_gold',
      };
    }
  }

  return {
    ...state,
    message: '🚫 You can only climb out from the entrance (bottom-left)!',
    lastAction: 'climb_wrong_cell',
  };
}

// CASH LUDO classic Ludo rules engine for two- and four-player games.
// Pure deterministic domain logic. Online play must run this on a trusted server.
export const RULES_VERSION = 2;
export const TRACK_LENGTH = 52;
export const HOME_LANE_LENGTH = 6;
export const FINISH_PROGRESS = TRACK_LENGTH + HOME_LANE_LENGTH;
export const TOKENS_PER_PLAYER = 4;
export const COLORS = Object.freeze(["red", "blue", "green", "yellow"]);
export const START_OFFSETS = Object.freeze({ red: 0, blue: 26, green: 13, yellow: 39 });
export const SAFE_SQUARES = Object.freeze([0, 8, 13, 21, 26, 34, 39, 47]);
export const MAX_CONSECUTIVE_SIXES = 3;

const clone = value => structuredClone(value);
const assertColor = color => { if (!COLORS.includes(color)) throw new Error("Unknown player color"); };
const orderFor = count => count === 2 ? ["red", "blue"] : count === 4 ? ["red", "green", "blue", "yellow"] : null;
const nextPlayer = (state, color) => {
  const i = state.playerOrder.indexOf(color);
  if (i < 0) throw new Error("Player is not active in this game");
  return state.playerOrder[(i + 1) % state.playerOrder.length];
};

export function createGame({ gameId = "local-game", players = {}, playerCount = 2 } = {}) {
  const playerOrder = orderFor(playerCount);
  if (!playerOrder) throw new Error("Choose either 2 or 4 players");
  const activePlayers = Object.fromEntries(playerOrder.map(color => [
    color, { id: players[color]?.id ?? null, name: players[color]?.name ?? color[0].toUpperCase()+color.slice(1) }
  ]));
  const tokens = Object.fromEntries(playerOrder.map(color => [color, [-1, -1, -1, -1]]));
  return {
    rulesVersion: RULES_VERSION, gameId, playerCount, playerOrder, status: "active",
    players: activePlayers, turn: playerOrder[0], consecutiveSixes: 0,
    pendingDice: null, awaitingBonusRoll: false, legalMoves: [], tokens, winner: null, version: 0, lastAction: null
  };
}

export function globalSquare(color, progress) {
  assertColor(color);
  if (!Number.isInteger(progress) || progress < 0 || progress >= TRACK_LENGTH) throw new Error("Progress is not on the main track");
  return (START_OFFSETS[color] + progress) % TRACK_LENGTH;
}
export function isSafeSquare(square) { return SAFE_SQUARES.includes(square); }

export function getLegalMoves(state, dice = state.pendingDice) {
  if (!state.playerOrder.includes(state.turn) || !Number.isInteger(dice) || dice < 1 || dice > 6) return [];
  const color = state.turn, moves = [];
  state.tokens[color].forEach((progress, token) => {
    if (progress === FINISH_PROGRESS) return;
    if (progress === -1) { if (dice === 6) moves.push({ token, type: "enter", from: -1, to: 0 }); return; }
    const destination = progress + dice;
    if (destination > FINISH_PROGRESS) return;
    if (destination < FINISH_PROGRESS && destination < TRACK_LENGTH) {
      const square = globalSquare(color, destination);
      const ownOnSquare = state.tokens[color].some((p, i) => i !== token && p >= 0 && p < TRACK_LENGTH && globalSquare(color, p) === square);
      if (ownOnSquare) return;
    }
    moves.push({ token, type: destination === FINISH_PROGRESS ? "finish" : "move", from: progress, to: destination });
  });
  return moves;
}

function applyCapture(state, color, destination) {
  if (destination < 0 || destination >= TRACK_LENGTH) return [];
  const square = globalSquare(color, destination);
  if (isSafeSquare(square)) return [];
  const captured = [];
  for (const opponent of state.playerOrder) {
    if (opponent === color) continue;
    state.tokens[opponent] = state.tokens[opponent].map((progress, token) => {
      if (progress >= 0 && progress < TRACK_LENGTH && globalSquare(opponent, progress) === square) {
        captured.push({ color: opponent, token }); return -1;
      }
      return progress;
    });
  }
  return captured;
}

export function rollDice(state, dice) {
  if (state.status !== "active" || state.winner) throw new Error("Game is not active");
  if (state.pendingDice !== null) throw new Error("Choose a token for the pending roll first");
  if (!Number.isInteger(dice) || dice < 1 || dice > 6) throw new Error("Dice must be an integer from 1 to 6");
  const next = clone(state);
  if (dice === 6) {
    next.consecutiveSixes += 1;
    if (next.consecutiveSixes >= MAX_CONSECUTIVE_SIXES) {
      next.consecutiveSixes = 0; next.awaitingBonusRoll = false;
      next.turn = nextPlayer(next, state.turn); next.legalMoves = [];
      next.lastAction = { type: "three-sixes-forfeit", dice, player: state.turn };
    } else {
      next.awaitingBonusRoll = true; next.legalMoves = [];
      next.lastAction = { type: "bonus-roll", dice, player: state.turn, bonusRolls: next.consecutiveSixes };
    }
    next.version++; return next;
  }
  next.consecutiveSixes = 0; next.awaitingBonusRoll = false;
  next.pendingDice = dice; next.legalMoves = getLegalMoves(next, dice);
  if (next.legalMoves.length === 0) {
    next.pendingDice = null; next.turn = nextPlayer(next, state.turn);
    next.lastAction = { type: "no-legal-move", dice, player: state.turn };
  } else next.lastAction = { type: "roll", dice, player: state.turn };
  next.version++; return next;
}

export function moveToken(state, tokenIndex) {
  if (state.status !== "active" || state.winner) throw new Error("Game is not active");
  if (state.pendingDice === null) throw new Error("Roll the dice before moving");
  if (!Number.isInteger(tokenIndex) || tokenIndex < 0 || tokenIndex >= TOKENS_PER_PLAYER) throw new Error("Token index must be between 0 and 3");
  const move = state.legalMoves.find(candidate => candidate.token === tokenIndex);
  if (!move) throw new Error("That token cannot make a legal move");
  const next = clone(state), color = state.turn;
  next.tokens[color][tokenIndex] = move.to;
  const captured = move.type === "move" ? applyCapture(next, color, move.to) : [];
  const won = next.tokens[color].every(progress => progress === FINISH_PROGRESS);
  next.pendingDice = null; next.awaitingBonusRoll = false; next.legalMoves = [];
  if (won) { next.winner = color; next.status = "finished"; }
  else { next.turn = nextPlayer(next, color); next.consecutiveSixes = 0; }
  next.lastAction = { type: move.type, player: color, token: tokenIndex, from: move.from, to: move.to, captured };
  next.version++; return next;
}

export function getPlayerTokenStatus(state, color) {
  assertColor(color);
  if (!state.tokens[color]) return [];
  return state.tokens[color].map((progress, token) => ({
    token, progress, status: progress === -1 ? "base" : progress === FINISH_PROGRESS ? "finished" : progress < TRACK_LENGTH ? "track" : "home-lane",
    square: progress >= 0 && progress < TRACK_LENGTH ? globalSquare(color, progress) : null
  }));
}

export function applyPlayerCommand(state, command, { authenticatedColor, expectedVersion, dice } = {}) {
  if (expectedVersion !== state.version) throw new Error("Stale game state; reload before retrying");
  if (authenticatedColor !== state.turn) throw new Error("It is not this player's turn");
  if (!command || typeof command !== "object") throw new Error("Invalid command");
  if (command.type === "roll") return rollDice(state, dice);
  if (command.type === "move") return moveToken(state, command.token);
  throw new Error("Unsupported game command");
}

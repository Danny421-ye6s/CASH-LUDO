// Cash Ludo starter rules module. Virtual play only.
export const BOARD_SIZE = 52;
export const SAFE_SQUARES = Object.freeze([0, 8, 13, 21, 26, 34, 39, 47]);
export const createGame = () => ({ turn: "red", dice: null, progress: { red: 0, blue: 0 }, winner: null, version: 0 });
export function roll(state, value) {
  if (!Number.isInteger(value) || value < 1 || value > 6) throw new Error("Dice must be 1–6");
  if (state.winner || state.dice !== null) throw new Error("A roll is already awaiting a move");
  return { ...state, dice: value, version: state.version + 1 };
}
export function move(state) {
  if (state.winner || state.dice === null) throw new Error("Roll before moving");
  const progress = { ...state.progress, [state.turn]: state.progress[state.turn] + state.dice };
  const winner = progress[state.turn] >= BOARD_SIZE ? state.turn : null;
  return { turn: winner || state.dice === 6 ? state.turn : state.turn === "red" ? "blue" : "red", dice: null, progress, winner, version: state.version + 1 };
}

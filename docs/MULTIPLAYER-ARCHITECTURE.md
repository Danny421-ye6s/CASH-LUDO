# CASH LUDO — Multiplayer architecture (decision record)

Status: approved direction; implementation not yet connected to a live backend.

## Product requirements
- Original Ludo experience for web and Android/PWA.
- 1-versus-1 first; private invite rooms before public matchmaking.
- All coins are virtual and have no cash value.
- No deposits, withdrawals, wagers, paid entry, or cash prizes.
- Dark navy and gold visual identity.

## Decision: server-authoritative game
The browser is a display and input client, never the authority for dice, legal moves, turns, captures, or wins.

### Proposed stack
- TypeScript for shared contracts and game domain code.
- React + Vite for the responsive web/PWA client.
- Firebase Authentication for guest/player identity.
- Firebase Realtime Database for room presence and live state delivery.
- Firebase Cloud Functions (or an equivalent trusted server) for every state-changing game command.
- GitHub Actions for automated linting and tests.
- Hosting selected after the backend region, quotas, and cost limits are reviewed.

## Command flow
1. Client signs in and requests a private room.
2. Trusted function creates a short room code using a collision-checked random identifier.
3. Opponent joins; server checks room status, capacity, and membership.
4. Server assigns seats and initial state.
5. Player sends an intent (roll, move token, leave, request rematch), not a proposed new state.
6. Trusted function verifies identity, membership, turn, phase, and legal action; generates dice using server-side cryptographic randomness; applies rules; commits with a transaction/version check.
7. Both clients receive the committed state from the realtime database.
8. On reconnect, client reloads authoritative state from the server.

## Minimum room data
- roomId, roomCodeHash, status, createdAt, expiresAt
- players: seat, uid, displayName, connected/presence
- game: rulesVersion, stateVersion, currentPlayer, phase, pieces, dice/result, winner
- audit: actionId, actorUid, command, serverTimestamp, resultingVersion

Do not store plain room secrets or trust a client-provided UID, dice result, winner, timestamp, or full replacement state.

## Security requirements
- Clients may read only rooms they are members of (plus a deliberately limited lobby listing later).
- Clients cannot write authoritative game state, dice, turn, winner, balances, or room membership directly.
- All mutations go through authenticated trusted functions.
- Validate payload shape, size, rate, room status, membership, turn, and expected state version.
- Use idempotency/action IDs to prevent duplicate commands.
- Add expiry and cleanup for abandoned rooms; rate-limit room creation and joining.
- Never put service-account keys or admin credentials in the browser or GitHub.
- Virtual coins are cosmetic only; do not connect payment APIs or prize redemption.

## Scaling and operations
Do not claim a player capacity from architecture alone. Measure concurrent connections, function throughput, database reads/writes, latency, and reconnect behavior with staged load tests. Partition room state by room ID, minimise writes, avoid global hot counters, and set budgets/alerts before public launch.

## Delivery sequence
1. Confirm exact Ludo rules/variant and write exhaustive domain tests.
2. Build trusted game engine and command handlers.
3. Add Firebase project, Authentication, Realtime Database, Functions, and deny-by-default rules.
4. Add private room UI and two-device integration tests.
5. Add reconnect, presence, expiry, abuse controls, and observability.
6. Add public matchmaking only after private rooms are stable.
7. Run staged load/security tests; then publish Android/PWA and web.

## Current truth
The repository currently contains a small client-side demo. Private-room buttons are placeholders. No Firebase project is connected, no secure server functions exist, and cross-device multiplayer is not working yet.

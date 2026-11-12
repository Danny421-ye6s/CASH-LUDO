# CASH LUDO — next build checklist

## Current repository state
- [x] GitHub repository connected and source files committed.
- [x] Navy/gold responsive starter screen.
- [x] Basic local dice/turn demonstration.
- [x] PWA manifest and service-worker starter.
- [x] Initial unit-test file for the small rules module.
- [x] Server-authoritative architecture decision documented.
- [ ] Replace toy board with complete agreed Ludo rules and 4 pieces per player.
- [ ] TypeScript domain engine with exhaustive legal-move tests.
- [ ] Trusted backend functions for room creation/join and game commands.
- [ ] Firebase project configuration and security rules.
- [ ] Two-device private-room integration test.
- [ ] Public matchmaking, accounts/profile, leaderboard, voice chat.

## Do not misrepresent
The current local demo is not a complete classic Ludo game. The online room buttons do not create or join rooms. A live backend must be configured before online play can work.

## First decision needed
Before implementing the full rules engine, confirm the intended variant: classic 4-token Ludo (each player has four tokens, needs a six to leave base, exact roll to finish, safe squares, captures, and six grants another roll) or a different ruleset. Record any house rules explicitly and test them.

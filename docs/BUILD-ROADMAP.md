# CASH LUDO — build roadmap

## Current repository state
- [x] GitHub repository connected and source files committed.
- [x] Navy/gold responsive application shell and PWA starter.
- [x] Agreed rules: two local players, four tokens each, six to leave base, 52-square track, six-square home lane, exact roll to finish, safe squares, captures, extra roll on six, and three consecutive sixes forfeit.
- [x] Pure JavaScript game engine with versioned commands and legal-move checks.
- [x] Automated Node test suite added for core game rules.
- [x] Local Node validation: 15 game-engine tests passed.
- [x] Local board UI connected to the game engine (no online play yet).
- [ ] Run the test suite in GitHub Actions and resolve any failures.
- [ ] Review board layout and rule variants on real Android screen sizes.
- [ ] Add secure server-authoritative room creation/join and game commands.
- [ ] Configure Firebase Authentication, Realtime Database, and security rules.
- [ ] Test a private room on two devices.
- [ ] Add public matchmaking, profiles, leaderboard, and optional voice features.

## Important boundaries
The local game is a practice prototype. Dice are currently generated in the browser and must not be trusted for competitive online play. Online room buttons and multiplayer are not implemented. No deposits, withdrawals, wagers, paid entry, or cash prizes are enabled. Do not claim support for 100,000 concurrent players until architecture and load testing demonstrate it.

## Rules note
This is the agreed two-player classic-style ruleset. Safe-square placement and stacking rules can differ between regional Ludo variants. The current engine prevents a player's token from landing on another of their own tokens; this is a documented house rule for this version.

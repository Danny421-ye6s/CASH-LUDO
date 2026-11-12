# CASH LUDO

An original, mobile-first Ludo game prototype for Android browsers and the web.

## Product boundaries
- Play-money prototype only: coins are virtual and have no cash value.
- No deposits, withdrawals, paid entry, wagers, or cash prizes.
- Original name, visual design, code, and artwork; do not copy another game's protected branding or assets.

## Current milestone
The next milestone is reliable online 1-versus-1 play with private invite rooms.

## Planned milestones
1. Preserve and test the local two-player game.
2. Add guest identity and private room creation/joining.
3. Synchronise turns and game state between two devices.
4. Add public matchmaking, player profiles, and leaderboards.
5. Harden server-side validation and moderation before wider release.
6. Package and publish Android/PWA and website builds.

## Important technical note
Online multiplayer requires a configured backend (for example Firebase Authentication and Realtime Database). Client-only checks are not anti-cheat protection. Never use this prototype for money or prizes.

## Android development
Use Chrome on Android for the web/PWA build. See [README-ANDROID.md](README-ANDROID.md) for setup once the application source is present.

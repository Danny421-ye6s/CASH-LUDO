# Android setup
1. Open this repository in GitHub on your Android phone.
2. The current index.html is a browser prototype. Open it through a static HTTPS host to test it on a phone.
3. GitHub Pages can host the website: repository Settings → Pages → Deploy from a branch → main → /(root) → Save.
4. Wait for deployment, then open the published Pages URL in Chrome.
5. In Chrome's menu choose Install app or Add to Home screen.

## Current limitations
- Local demo is a deliberately small starter, not complete classic Ludo.
- Private room buttons are explanatory placeholders; Firebase is not configured and no online room is created.
- No accounts, matchmaking, voice chat, deposits, withdrawals, wagers or cash prizes.
- Before real multiplayer, implement trusted server-side validation and strict database rules. Do not rely on client-side dice or move checks for competitive play.

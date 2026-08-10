# Frontend — Sahikaca web app

Web client for the Sahikaca price-guessing game. Talks to the Rust backend
(`../backend`) over HTTP (axios) and WebSocket.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (+ postcss), headlessui/radix/heroicons/lucide for UI
- framer-motion, livekit-client, axios
- ESLint (`eslint.config.js`)

## Commands

```sh
npm install
npm run dev       # vite dev server
npm run build     # production build
npm run lint      # eslint
npm run preview   # preview production build
```

## Layout

- `src/` — application code
- `index.html`, `vite.config.ts`, `tailwind.config.js` — build config
- `Dockerfile`, `nginx.conf`, `k8-deployment.yaml` — containerized deploy
  (static build served by nginx)

## Conventions

- The backend API/WS contract lives in `../backend/docs/` (`ws-protocol.md`,
  `docs/postman/`). Treat it as the source of truth; coordinate breaking
  changes across repos.
- Match the existing component and styling patterns in `src/` (Tailwind
  utility classes, existing design tokens) rather than introducing new
  libraries or style systems.
- `private-room-create-doc.md` holds feature notes.

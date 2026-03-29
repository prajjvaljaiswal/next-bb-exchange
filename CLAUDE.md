# CLAUDE.md — Frontend

This file provides guidance to Claude Code when working in `frontend/next-bb-exchange-1/`.
Context files live two levels up at `../../`.

---

## Startup Sequence (every session, in this order)

1. Read `../../BASE_CONTEXT.md`
2. Read `../../PROJECT_CONTEXT.md` — check `<!-- WIP -->` and `<!-- HANDOFF -->` tags
3. Read the contract file(s) for what you are touching today:

| Touching | Read |
|----------|------|
| Calling any backend endpoint | `../../API_CONTRACTS.md` |
| Wiring any Socket.IO event | `../../WS_PROTOCOL.md` |
| Matching response shape to component state | `../../UI_STATE.md` |

---

## After Any Code Change

| Changed | Update |
|---------|--------|
| React context, hook, or component state shape | `../../UI_STATE.md` |
| Feature status | `../../PORTAL_CAPABILITIES.md` frontend column |
| Anything | `../../PROJECT_CONTEXT.md` file change log |
| Anything | `../../SESSION_LOG.md` session entry |

Cross-side handoff — when a change requires backend action, append to `../../PROJECT_CONTEXT.md`:
```
<!-- HANDOFF -->
### Handoff — YYYY-MM-DD [FE→BE]
Changed: <file>
Impact: <what BE needs to know>
Action: <task or "informational only">
```

---

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`
- `NEXT_PUBLIC_SOCKET_URL=http://localhost:5000`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx`
- `NEXT_PUBLIC_APP_NAME=Bloodexchange.in`
- `NEXT_PUBLIC_DEV_MODE=true` — enables Razorpay mock + DevBanner

---

## Architecture

**Next.js 15 App Router** — React 19 — Tailwind CSS v4.

- `app/` — All pages and layouts use the App Router convention
- `components/ui/` — Shared UI components (Badge, BloodTag, CertCard, DataTable, etc.)
- `context/` — AuthContext, SocketContext, ToastContext (all wired in root `layout.js`)
- `hooks/` — useAuth, useSocket, useToast, usePagination
- `lib/` — api.js (fetch wrapper), auth.js (token memory store), socket.js (singleton), constants.js, razorpay.js

**Path alias:** `@/*` maps to project root.

### Key Tech Details

- **Tailwind CSS v4** — Uses `@tailwindcss/postcss` plugin. Add utilities via `@layer` or inline classes. No `tailwind.config.js`.
- **ESLint 9 flat config** — `eslint.config.mjs`, extends `next/core-web-vitals`.
- **No TypeScript** — Plain JavaScript (`.js` files).

### Auth

Access token lives in **memory only** (JS variable in `lib/auth.js`). Never stored in localStorage or sessionStorage. Refresh token is an httpOnly cookie — silent refresh runs every 14 min via `AuthContext`.

### API Calls

Use `lib/api.js` for all fetch calls — it attaches the `Authorization` header automatically and handles 401 → silent token refresh. Never call `fetch` directly.

### Socket.IO

Socket singleton from `lib/socket.js`. Connect after login, disconnect on logout (both handled in `AuthContext`). Rooms are joined server-side — frontend does not emit join events. Subscribe to events in `useEffect` with cleanup.

### Route Protection

`middleware.js` at project root protects all portal routes by role. Unauthenticated → `/login`. Wrong role → own dashboard.

### Dev Mode

`NEXT_PUBLIC_DEV_MODE=true` enables Razorpay mock (browser `confirm()` dialog) and shows the `DevBanner` component.

---

## Rules

1. Never call an endpoint not listed in `../../API_CONTRACTS.md` — add a `<!-- HANDOFF -->` note if missing
2. Never subscribe to a Socket.IO event marked `<!-- UNIMPLEMENTED -->` in `../../WS_PROTOCOL.md`
3. Never modify backend source files
4. Never delete existing info from context files — only append, update, or clarify
5. Never store access token outside memory (no localStorage, no sessionStorage, no cookies)
6. Never duplicate content that already exists in another context file

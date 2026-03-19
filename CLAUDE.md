# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a **Next.js 15+ App Router** project using React 19 and Tailwind CSS v4.

- `app/` — All pages and layouts use the Next.js App Router convention
  - `layout.js` — Root layout; sets up Geist fonts and global metadata
  - `page.js` — Home page
  - `globals.css` — Global styles with Tailwind v4 imports
- `public/` — Static assets served at root URL

**Path alias:** `@/*` maps to the project root (e.g., `import Foo from "@/components/Foo"`).

## Key Tech Details

- **Tailwind CSS v4** — Uses `@tailwindcss/postcss` plugin (not the classic `tailwind.config.js` approach). Add utilities directly in CSS using `@layer` or inline classes.
- **ESLint 9 flat config** — Configuration is in `eslint.config.mjs` using the new flat config format; extends `next/core-web-vitals`.
- **No TypeScript** — Project uses plain JavaScript (`.js` files).

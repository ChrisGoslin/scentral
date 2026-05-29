# Scentral — Project Status & Notes

**Last updated:** 2026-05-28
**Status:** Landing / marketing polish + demo flows

---

## Overview

Scentral is the fragrance discovery front-end and marketing surface. Recent work focused on a premium, minimal landing experience and a lightweight demo/save interaction to showcase product feel.

## Recent changes (2026-05-28)

- Landing hero redesign: two-column premium layout, refined typography, and decorative art (`app/page.tsx`, `public/images/landing-art.svg`).
- Interactive demo save flow (`app/components/DemoSave.tsx`) posting to `/api/demo/save` (lightweight POST route).
- Global micro-interactions and accessible focus/animation utilities in `app/globals.css`.
- Shared toast system: `app/components/ToastProvider.tsx` (exported `ToastContext`) and `app/components/useToast.tsx` for in-app notifications.
- Documentation and PR artifacts added: `docs/ux/scentral-landing-spec.md`, `docs/ux/scentral-landing-checklist.md`, `PR_DESCRIPTION.md` updated, `scripts/create-pr.sh` helper added.
- Interactive scent-bloom enhancement: pointer-follow radial glow and subtle parallax tilt on the hero art (`app/components/ScentBloom.tsx`, `app/globals.css`) to increase tactile, premium feel.
- Audio chord micro-interaction: optional WebAudio soft pad triggered by the bloom with a persistent toggle (`app/components/AudioChord.tsx`).

## Impact

- Improves first-impression conversion with a sensory, polished hero.
- Adds a safe demo path for users to interact with the product and for developers to test feedback flows.
- Provides a small, reusable toast pattern for UX feedback across components.

## How to test locally

1. Install and run the app:

```bash
cd scentral
npm install
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) and verify:

- Hero renders and layout is responsive
- Decorative art appears on large screens
- Click the demo "Save" CTA → network POST to `/api/demo/save` and a toast appears

1. Run lint/type checks if configured:

```bash
npm run lint
npm run build
```

## PR / branch guidance

- Branch name suggestion: `scentral/landing-scent-bloom-plus-audio`
- Commit message template: `scentral: landing hero redesign + demo save + optional audio chord`
- Include these files for review: `app/page.tsx`, `app/components/DemoSave.tsx`, `app/components/ToastProvider.tsx`, `app/globals.css`, `docs/ux/scentral-landing-spec.md`, `docs/ux/scentral-landing-checklist.md`, `PR_DESCRIPTION.md`.
- Reviewer checklist: run local dev, verify demo save + toast, check reduced-motion and keyboard focus behavior.

---

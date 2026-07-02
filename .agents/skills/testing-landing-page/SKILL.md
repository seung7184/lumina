---
name: testing-landing-page
description: Test the lumina landing page end-to-end. Use when verifying landing page UI changes, interactive elements, or navigation between landing and workspace.
---

# Testing the Lumina Landing Page

## Prerequisites
- Node.js and npm installed
- Repository cloned at `/home/ubuntu/repos/lumina`

## Devin Secrets Needed
None — the landing page runs locally without authentication.

## Setup
1. `cd /home/ubuntu/repos/lumina && npm install`
2. `npm run dev` — starts Next.js dev server at `http://localhost:3000`
3. Maximize browser window before recording

## Routes
- `/` — Landing page (marketing page)
- `/workspace` — WorkspaceShell (the main app)

## Key Interactive Elements to Test

### FAQ Accordion (scroll to bottom half of page)
- Located in the "Frequently Asked Questions" section
- First item ("What is Lumina?") is expanded by default
- Clicking another question expands it and collapses the previous one
- Only one item can be open at a time
- Verify answer text content changes when switching items

### Testimonial Role Tabs (above FAQ section)
- Role chips: Leadership, Research, Investment, Consulting, Educator, Student, Creator, Product, Engineering, Marketing, Medical
- Active chip has teal (`--p-teal: #117f6f`) background
- Clicking a different role swaps all 3 testimonial cards
- Leadership default cards: Young Jeon, Jinho Heo, Kyungjung Min
- Research cards: Dr. Min Park, Sarah Chen, Prof. Kim

### Navigation CTAs
- "Get started" button in sticky navbar → navigates to `/workspace`
- "Start for free" in hero → navigates to `/workspace`
- Feature card CTAs (Start Summarizing, etc.) → navigate to `/workspace`
- Footer "Lumina" logo → navigates to `/` (landing page)

### Sticky Navbar
- Navbar should remain fixed at top while scrolling
- Contains: Lumina brand, Product/Solutions/Resources/Pricing links, language toggle, "Get started" CTA

## Landing Page Sections (top to bottom)
1. Sticky navbar
2. Hero with badge ("1.2M+ users reached"), headline, subtitle, CTA
3. "Unlimited Brain" interstitial
4. Demo window (split-pane with Korean transcript + summary)
5. Social proof bar (company names)
6. "Your job? Surprisingly easy" + Genius mode heading
7. 5 feature cards (numbered 1/5 through 5/5)
8. Andrej Karpathy quote
9. Knowledge hub grid (6 cards)
10. Role-filtered testimonials
11. FAQ accordion (5 items)
12. CTA section
13. Footer (4 columns: brand, Learn, Company, Connect)

## Design Token Verification
All landing page styles use lumina's CSS custom properties:
- `--p-paper: #f2ece0` (page background)
- `--p-surface: #fbf8f1` (card backgrounds)
- `--p-teal: #117f6f` (CTAs, active chips)
- `--p-cream: #f1e7ce` (Unlimited Brain section background)
- `--p-ink: #15140f` (text color)

## Common Issues
- The `Youtube` icon from lucide-react might not be available in all versions; `Video` is a safe alternative
- Internal navigation must use Next.js `Link` component (not `<a>` tags) to pass eslint
- CSS classes use `.landing-*` prefix to avoid conflicts with workspace styles

## Build Verification
```bash
npm run build    # Should complete with no errors
npm run lint     # Should pass with 0 errors
npm run typecheck # Should pass (if available)
```

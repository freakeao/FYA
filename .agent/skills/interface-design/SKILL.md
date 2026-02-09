---
name: interface-design
description: Design high-quality dashboards, admin panels, and SaaS interfaces with intentional choices and unique signatures.
---

# Interface Design

Use for: Dashboards, admin panels, SaaS apps, tools, settings pages, data interfaces.
Not for: Landing pages, marketing sites, campaigns. Redirect those to `frontend-design`.

## Intent First

### Every Choice Must Be A Choice
For every decision, you must be able to explain WHY.
- Why this layout and not another?
- Why this color temperature?
- Why this typeface?
- Why this spacing scale?
- Why this information hierarchy?
If your answer is "it's common" or "it's clean" or "it works" — you haven't chosen. You've defaulted.

### Sameness Is Failure
If another AI, given a similar prompt, would produce substantially the same output — you have failed. Design from the specific problem, user, and context.

### Intent Must Be Systemic
Intent is a constraint that shapes every decision. If the intent is "warm", everything (surfaces, text, borders, accents) must be warm.

## Product Domain Exploration

Before proposing a direction, produce all four:
1. **Domain**: Concepts, metaphors, vocabulary from this product's world (min. 5).
2. **Color world**: Colors that exist naturally in this product's domain (min. 5).
3. **Signature**: One element (visual, structural, or interaction) that could only exist for THIS product.
4. **Defaults**: 3 obvious choices for this interface type that you will avoid or replace.

## Craft Foundations

### Subtle Layering
Surfaces must be barely different but still distinguishable (whisper-quiet shifts). Borders must be light but not invisible.

### Infinite Expression
Every pattern has infinite expressions. A metric display could be a hero number, sparkline, gauge, etc. Avoid identical outputs.

### Color Lives Somewhere
Palette should feel like it came FROM somewhere. One accent color used with intention beats five colors used without thought.

## Design Principles
- **Spacing**: Pick a base unit and stick to multiples.
- **Depth**: Choose ONE approach (Borders-only, Subtle shadows, or Layered shadows) and commit.
- **Typography**: Headlines need weight/tight tracking; body needs readability; data needs monospace.
- **States**: Every interactive element needs default, hover, active, focus, disabled states.

## The Mandate (The Checks)
Run these before presenting:
- **The Swap Test**: If you swapped the typeface or layout for standard ones, would it feel different?
- **The Squint Test**: Blur your eyes. Is the hierarchy still perceivable without harshness?
- **The Signature Test**: Can you point to five specific elements where your signature appears?
- **The Token Test**: Do your CSS variables sound like they belong to this product's world?

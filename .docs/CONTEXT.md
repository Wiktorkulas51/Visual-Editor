# Project Context: Visual Editor

An advanced Chrome Extension acting as a visual editor (Figma-like) directly in the browser, allowing for live CSS manipulation and responsive design synchronization.

## Architecture & Principles
- **Core Technology**: Vite + Vanilla JS + Tailwind CSS (pending version).
- **UI Architecture**: Atomic Design (`src/components/ui/{atoms,molecules,organisms}`).
- **Isolation**: Shadow DOM for the extension UI to avoid conflicts with host page styles.
- **Workflow**: Mobile-First, TDD approach.

## Current Project Structure
```
/
├── .docs/
│   └── CONTEXT.md (this file)
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   └── organisms/
│   │   └── studio/ (Internal UI for the builder)
│   ├── utils/ (Shared logic)
│   ├── main.js
│   └── index.css
├── manifest.json (Configuration for Chrome Extension)
└── package.json
```

## Task Progress
- [x] Project Initialization with Vite.
- [x] Base dependencies installed.
- [ ] Tailwind CSS configuration (Awaiting version choice: v3 or v4).
- [x] Manifest.json setup.
- [x] Directory structure preparation (Atomic Design).
- [x] Shadow DOM UI entry point implementation.
- [x] Inspector overlay with element picking.
- [x] Live spacing editing for margin and padding.
- [x] Core spacing utilities covered by tests.
- [x] Side Panel migration foundation.
- [x] MV3 background service worker and manifest support.
- [x] Page push logic for active side panel state.
- [x] Inspector overlay box with cursor tracking and lock-on-click.
- [x] InspectorToggle atom and SpacingControl molecule extraction.
- [x] Body-safe inspector overlay attachment and icon-based InspectorToggle UI.
- [x] Inline-styled overlay boxes in shadow DOM and panel-width status labeling.

## Key Patterns
- **Line Endings**: LF
- **Visuals**: Rich Aesthetics, Glassmorphism, Premium Dark Mode.
- **Mobile-First**: Default styles are mobile, `md:` for desktop.

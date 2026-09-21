# 2048 Desert Edition 🏜️

A luxury, mobile-first **2048** web game built with **React 19**, **Vite**, and pure **SCSS** (zero Tailwind).

Featuring a rich desert theme, tactile 3D beveled stone number cubes, procedural sand textures, Web Audio synthesized sounds, responsive touch gestures, and a 5-step Undo mechanic.

---

## ✨ Features

- **Luxury Desert Aesthetic**: Procedural sand textures, warm dune lighting, and carved 3D number cubes with bevels and physical depth shelves.
- **Dynamic 3D Number Cubes**: Custom visual progression from Light Ivory Sand (2) to Terracotta (64), Metallic Gold (2048), and Obsidian Gold (4096+).
- **Official 2048 Game Rules**:
  - Rule 1: Whole-board slide as far as it can go (orthogonal only).
  - Rule 2: Only identical tiles merge and double in value.
  - Rule 3: Merged tiles lock for the rest of that swipe (no cascading merges).
  - Rule 4: Exactly one new tile spawns per valid move. Swipes that change nothing are discarded.
  - Rule 5: 2048 milestone win overlay with option to continue playing for higher scores.
  - Rule 6: Game over occurs only when the board is completely full and no legal adjacent moves remain.
- **5-Step Undo System**: Roll back up to 5 previous board states and scores, even from the Game Over screen!
- **Fluid Gestures & Controls**:
  - Touch swipe with directional threshold detection
  - Mouse click-and-drag
  - Keyboard Arrow keys & WASD
  - Keyboard Undo (`u`, `Backspace`, `Ctrl+Z`)
- **Web Audio Sound Effects**: Synthesized stone slides, ascending merge chimes, golden fanfare on 2048, and mute toggle.
- **Local Persistence**: Best score and mute preferences automatically saved in `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Pure SCSS / SASS with mixins and CSS custom properties (zero CSS frameworks)
- **Audio**: Web Audio API (100% synthesized, zero external audio asset dependencies)
- **Linter**: Oxlint

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser (or use mobile device simulation in DevTools).

### 3. Build for Production
```bash
npm run build
```

---

## 📜 License

MIT License.

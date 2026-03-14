# RedTeam Arena — AI Adversarial Search Engine

A hackathon-grade cybersecurity battle simulator where two AI agents (PHANTOM vs AEGIS)
use **minimax with alpha-beta pruning** to play out real-world attack/defense scenarios.

---

## Project Structure

```
redteam-arena/
│
├── index.html              ← Entry point — all markup, loads CSS + JS
│
├── css/
│   ├── base.css            ← CSS variables, reset, scanlines, grid bg
│   ├── layout.css          ← Arena grid, header, center panel, verdict
│   ├── agents.css          ← Agent side panels, scores, log entries
│   ├── tree.css            ← Canvas wrap, metrics strip, node legend
│   ├── controls.css        ← Bottom bar, buttons, selects
│   └── animations.css      ← All @keyframes and animation utilities
│
└── js/
    ├── scenarios.js        ← All 5 scenario definitions (moves + descriptions)
    ├── minimax.js          ← Adversarial search engine (minimax + alpha-beta)
    ├── tree-renderer.js    ← Canvas game tree visualizer
    ├── api.js              ← Anthropic Claude API integration (PHANTOM + AEGIS)
    ├── ui.js               ← All DOM updates and UI state management
    └── arena.js            ← Main game controller (orchestrates everything)
```

---

## How to Run

Just open `index.html` in any modern browser. No build step, no server required.

```bash
open index.html
# or
python3 -m http.server 8080  # then visit http://localhost:8080
```

---

## Architecture

```
User clicks INITIATE
        │
        ▼
    arena.js  (game loop)
    ├── scenarios.js     → loads move vocabulary
    ├── minimax.js       → runs adversarial search, returns node tree + stats
    ├── tree-renderer.js → draws node tree on <canvas>
    ├── api.js           → calls Claude API for PHANTOM + AEGIS narrations
    └── ui.js            → updates scores, logs, metrics, verdict
```

### Script Load Order (index.html)
Scripts must load in this exact order due to dependencies:
1. `scenarios.js`    — no deps
2. `minimax.js`      — no deps
3. `tree-renderer.js`— no deps
4. `api.js`          — no deps
5. `ui.js`           — no deps
6. `arena.js`        — depends on all of the above

---

## Key Algorithms

### Minimax (`minimax.js`)
- Recursive depth-first search
- Branching factor: 3 (each agent considers 3 moves per ply)
- Leaf nodes evaluated with a heuristic score in [-10, +10]
- Scores backed up: MAX levels take max, MIN levels take min

### Alpha-Beta Pruning (`minimax.js`)
- Alpha = best score MAX is guaranteed so far
- Beta  = best score MIN is guaranteed so far
- Branch pruned when alpha ≥ beta (no better outcome possible)
- Typically cuts ~50% of nodes vs raw minimax

### Scoring (`arena.js`)
| Outcome        | Condition               |
|----------------|-------------------------|
| BREACH         | ATK > DEF × 1.25        |
| DEFENSE HOLDS  | DEF ≥ ATK × 0.85        |
| STALEMATE      | Neither condition met    |

---

## Scenarios

| Key          | Name                    | Real-world example              |
|--------------|-------------------------|---------------------------------|
| `sql`        | SQL Injection           | LinkedIn breach 2012            |
| `phishing`   | Phishing Campaign       | Colonial Pipeline 2021          |
| `privesc`    | Privilege Escalation    | Most ransomware kill chains     |
| `ransomware` | Ransomware Deployment   | Irish Health Service 2021       |
| `exfil`      | Data Exfiltration       | SolarWinds 2020                 |

---

## Technologies

- **Vanilla HTML/CSS/JS** — zero dependencies, zero build step
- **Anthropic Claude API** — powers PHANTOM and AEGIS agent narrations
- **Canvas 2D API** — game tree visualization
- **Google Fonts** — Orbitron (display), JetBrains Mono (code), Exo 2 (body)

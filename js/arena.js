/* ═══════════════════════════════════════════════
   arena.js — main game controller
   Orchestrates: minimax → tree render → API calls
   → UI updates → scoring → verdict
   ═══════════════════════════════════════════════ */

const Arena = (() => {

  // ── Game state ──
  const state = {
    running:   false,
    atkScore:  0,
    defScore:  0,
    maxRounds: 5
  };

  // ── Score gain ranges per round ──
  const SCORE = {
    atkMin: 2.0, atkMax: 6.0,
    defMin: 1.5, defMax: 4.5
  };

  // ── Verdict thresholds ──
  const THRESH = {
    breach:  1.25,  // ATK > DEF × 1.25 → breach
    defense: 0.85   // DEF ≥ ATK × 0.85 → defense holds
  };

  function rand(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getDepth() {
    return parseInt(document.getElementById('depthSelect').value);
  }

  function getScenarioKey() {
    return document.getElementById('scenarioSelect').value;
  }

  // ── Single round execution ──
  async function runRound(scenario, roundNum) {
    const s     = SCENARIOS[scenario];
    const depth = getDepth();

    const atkMove = s.atkMoves[roundNum % s.atkMoves.length];
    const defMove = s.defMoves[roundNum % s.defMoves.length];

    UI.setRound(roundNum, state.maxRounds);

    // 1. Run minimax + render tree
    const result = Minimax.run(s.atkMoves, depth);
    window._lastTreeNodes = result.nodes;
    window._lastTreeDepth = depth;
    TreeRenderer.render(result.nodes, depth);

    UI.updateMetrics({
      bestMove: atkMove.slice(0, 18),
      nodes:    result.stats.totalNodes,
      pruned:   result.stats.pruned
    });

    // 2. PHANTOM's turn
    UI.setTurn('atk');
    UI.setLastMove('atk', atkMove);
    const atkEntry = UI.addLog('atk',
      `[R${roundNum}] Deploying: <b>${atkMove}</b><span class="thinking"></span>`
    );

    const atkResponse = await API.phantomMove(roundNum, atkMove, s.name);
    atkEntry.innerHTML =
      `<span class="log-time">${UI.ts()}</span>[R${roundNum}] <b>${atkMove}</b><br>${atkResponse}`;

    const atkGain = rand(SCORE.atkMin, SCORE.atkMax);
    state.atkScore = Math.round((state.atkScore + atkGain) * 10) / 10;
    UI.updateScore('atk', state.atkScore);

    await delay(500);

    // 3. AEGIS's turn
    UI.setTurn('def');
    UI.setLastMove('def', defMove);
    const defEntry = UI.addLog('def',
      `[R${roundNum}] Countering: <b>${defMove}</b><span class="thinking"></span>`
    );

    const defResponse = await API.aegisMove(roundNum, atkMove, defMove, s.name);
    defEntry.innerHTML =
      `<span class="log-time">${UI.ts()}</span>[R${roundNum}] <b>${defMove}</b><br>${defResponse}`;

    const defGain = rand(SCORE.defMin, SCORE.defMax);
    state.defScore = Math.round((state.defScore + defGain) * 10) / 10;
    UI.updateScore('def', state.defScore);

    await delay(600);
  }

  // ── Determine and display verdict ──
  function renderVerdict() {
    const atk = state.atkScore;
    const def = state.defScore;

    if (atk > def * THRESH.breach) {
      UI.showVerdict('atk-win',
        `◆ BREACH SUCCESSFUL — PHANTOM wins · ATK ${atk.toFixed(1)} vs DEF ${def.toFixed(1)} · Security posture compromised`
      );
    } else if (def >= atk * THRESH.defense) {
      UI.showVerdict('def-win',
        `◆ DEFENSE HOLDS — AEGIS wins · DEF ${def.toFixed(1)} neutralized ATK ${atk.toFixed(1)} · System secured`
      );
    } else {
      UI.showVerdict('draw',
        `◆ STALEMATE — ATK ${atk.toFixed(1)} / DEF ${def.toFixed(1)} · Recommend deeper search depth`
      );
    }
  }

  // ── Public: start simulation ──
  async function start() {
    if (state.running) return;

    // Reset state
    state.running  = true;
    state.atkScore = 0;
    state.defScore = 0;

    UI.resetAll();
    UI.setStartBtn('running');
    TreeRenderer.clear();

    const scenarioKey = getScenarioKey();
    const scenario    = SCENARIOS[scenarioKey];
    const depth       = getDepth();

    UI.setScenario(scenario.desc);
    UI.addSysLog(`Scenario loaded: <b>${scenario.name}</b>`);
    UI.addSysLog(`Alpha-beta pruning ON · Depth ${depth} · ${state.maxRounds} rounds`);

    await delay(400);

    // Run all rounds
    for (let r = 1; r <= state.maxRounds; r++) {
      await runRound(scenarioKey, r);
    }

    // Finalise
    UI.setTurn('idle');
    renderVerdict();
    UI.addSysLog(
      `Simulation complete · ATK: ${state.atkScore.toFixed(1)} | DEF: ${state.defScore.toFixed(1)}`
    );
    UI.setStartBtn('done');
    state.running = false;
  }

  // ── Public: reset everything ──
  function reset() {
    state.running  = false;
    state.atkScore = 0;
    state.defScore = 0;
    window._lastTreeNodes = null;
    UI.resetAll();
    TreeRenderer.clear();
  }

  return { start, reset };
})();

/* ═══════════════════════════════════════════════
   ui.js — all DOM updates and UI state management
   No game logic here — only presentation.
   ═══════════════════════════════════════════════ */

const UI = (() => {

  const MAX_SCORE = 30; // used for progress bar %

  // ── Timestamp helper ──
  function ts() {
    return new Date().toTimeString().slice(0, 8);
  }

  // ── Turn indicator in header ──
  function setTurn(state) {
    const pill  = document.getElementById('turnPill');
    const label = document.getElementById('turnLabel');

    const config = {
      atk:  { cls: 'status-pill atk',  text: 'PHANTOM ATTACKING' },
      def:  { cls: 'status-pill def',  text: 'AEGIS DEFENDING'   },
      idle: { cls: 'status-pill idle', text: 'STANDBY'           }
    };

    const c = config[state] || config.idle;
    pill.className  = c.cls;
    label.textContent = c.text;
  }

  // ── Round counter ──
  function setRound(current, total) {
    document.getElementById('roundCounter').textContent =
      `ROUND ${current} / ${total}`;
  }

  // ── Scenario description ──
  function setScenario(html) {
    document.getElementById('scenarioBox').innerHTML = html;
  }

  // ── Score update (with bar + bump animation) ──
  function updateScore(side, value) {
    const el  = document.getElementById(side + 'Score');
    const bar = document.getElementById(side + 'Bar');

    el.textContent    = value.toFixed(1);
    bar.style.width   = Math.min(100, (value / MAX_SCORE) * 100) + '%';

    // Trigger bump animation
    el.classList.remove('score-bump');
    void el.offsetWidth; // force reflow
    el.classList.add('score-bump');

    // Mirror to metrics strip
    const metricId = side === 'atk' ? 'mmAtk' : 'mmDef';
    document.getElementById(metricId).textContent = value.toFixed(1);
  }

  // ── Metrics strip ──
  function updateMetrics({ bestMove, nodes, pruned }) {
    if (bestMove !== undefined)
      document.getElementById('mmBest').textContent   = bestMove;
    if (nodes !== undefined)
      document.getElementById('mmNodes').textContent  = nodes;
    if (pruned !== undefined)
      document.getElementById('mmPruned').textContent = pruned;
  }

  // ── Last move stat on agent panel ──
  function setLastMove(side, move) {
    const id = side === 'atk' ? 'atkLastMove' : 'defLastMove';
    document.getElementById(id).textContent = move.slice(0, 14);
  }

  // ── Log entries ──
  function addLog(side, message) {
    const logEl = document.getElementById(side === 'atk' ? 'atkLog' : 'defLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${side}`;
    entry.innerHTML = `<span class="log-time">${ts()}</span>${message}`;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
    return entry; // return so caller can update it later (e.g. replace spinner)
  }

  function addSysLog(message) {
    ['atk', 'def'].forEach(side => {
      addLog(side, `<span style="color:rgba(255,204,0,0.7)">[SYS] ${message}</span>`);
    });
  }

  // ── Verdict banner ──
  function showVerdict(type, message) {
    const el = document.getElementById('verdict');
    el.textContent = message;
    el.className   = `verdict show ${type}`; // atk-win | def-win | draw
  }

  function hideVerdict() {
    document.getElementById('verdict').className = 'verdict';
  }

  // ── Start button state ──
  function setStartBtn(state) {
    const btn = document.getElementById('startBtn');
    const labels = {
      idle:    { text: 'INITIATE',   disabled: false },
      running: { text: 'RUNNING…',   disabled: true  },
      done:    { text: 'RUN AGAIN',  disabled: false  }
    };
    const s = labels[state] || labels.idle;
    btn.textContent = s.text;
    btn.disabled    = s.disabled;
  }

  // ── Full reset of all UI elements ──
  function resetAll() {
    document.getElementById('atkScore').textContent    = '0.0';
    document.getElementById('defScore').textContent    = '0.0';
    document.getElementById('atkBar').style.width      = '0%';
    document.getElementById('defBar').style.width      = '0%';
    document.getElementById('atkLog').innerHTML        = '';
    document.getElementById('defLog').innerHTML        = '';
    document.getElementById('atkLastMove').textContent = '—';
    document.getElementById('defLastMove').textContent = '—';
    document.getElementById('mmAtk').textContent       = '—';
    document.getElementById('mmDef').textContent       = '—';
    document.getElementById('mmBest').textContent      = '—';
    document.getElementById('mmNodes').textContent     = '0';
    document.getElementById('mmPruned').textContent    = '0';
    setRound(0, 0);
    hideVerdict();
    setTurn('idle');
    setStartBtn('idle');
    setScenario('Select a scenario below and press <strong>INITIATE</strong> to begin the adversarial simulation.');
  }

  return {
    ts, setTurn, setRound, setScenario,
    updateScore, updateMetrics, setLastMove,
    addLog, addSysLog,
    showVerdict, hideVerdict,
    setStartBtn, resetAll
  };
})();

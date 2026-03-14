/* ═══════════════════════════════════════════════
   tree-renderer.js — canvas game tree visualizer
   Draws the minimax node tree on <canvas id="treeCanvas">
   ═══════════════════════════════════════════════ */

const TreeRenderer = (() => {

  const COLORS = {
    atkFill:    'rgba(255, 34, 68, 0.12)',
    atkStroke:  '#ff2244',
    atkText:    '#ff6680',
    atkGlow:    '#ff2244',
    defFill:    'rgba(0, 255, 163, 0.08)',
    defStroke:  '#00ffa3',
    defText:    '#44ffbb',
    defGlow:    '#00ffa3',
    termFill:   'rgba(255, 204, 0, 0.15)',
    termStroke: '#ffcc00',
    termText:   '#ffcc00',
    termGlow:   '#ffcc00',
    pruneFill:  'rgba(30, 40, 100, 0.8)',
    pruneStroke:'#334488',
    pruneText:  '#334488',
    edgeNormal: 'rgba(255, 255, 255, 0.08)',
    edgePruned: 'rgba(51, 68, 170, 0.4)'
  };

  const NODE_RADIUS = 14;

  /** Returns how many levels deep a node is (0 = root). */
  function getLevel(nodes, idx) {
    let level = 0, cur = idx;
    while (nodes[cur]?.parentIdx != null) {
      cur = nodes[cur].parentIdx;
      level++;
      if (level > 20) break; // guard
    }
    return level;
  }

  /** Groups node indices by tree level. */
  function groupByLevel(nodes) {
    const byLevel = {};
    nodes.forEach((n, i) => {
      const lv = getLevel(nodes, i);
      if (!byLevel[lv]) byLevel[lv] = [];
      byLevel[lv].push(i);
    });
    return byLevel;
  }

  /** Computes (x, y) canvas position for every node. */
  function computePositions(nodes, W, H, depth) {
    const byLevel = groupByLevel(nodes);
    const levels  = depth + 1;
    const rowH    = H / levels;
    const pos     = {};

    Object.keys(byLevel).forEach(lv => {
      const arr = byLevel[lv];
      arr.forEach((idx, j) => {
        pos[idx] = {
          x: W * (j + 1) / (arr.length + 1),
          y: rowH * (+lv + 0.5)
        };
      });
    });

    return pos;
  }

  /** Draws a single node circle + label. */
  function drawNode(ctx, x, y, node) {
    const r = NODE_RADIUS;
    let fill, stroke, textColor, glowColor;

    if (node.pruned) {
      fill = COLORS.pruneFill; stroke = COLORS.pruneStroke;
      textColor = COLORS.pruneText; glowColor = null;
    } else if (node.terminal) {
      fill = COLORS.termFill; stroke = COLORS.termStroke;
      textColor = COLORS.termText; glowColor = COLORS.termGlow;
    } else if (node.isMax) {
      fill = COLORS.atkFill; stroke = COLORS.atkStroke;
      textColor = COLORS.atkText; glowColor = COLORS.atkGlow;
    } else {
      fill = COLORS.defFill; stroke = COLORS.defStroke;
      textColor = COLORS.defText; glowColor = COLORS.defGlow;
    }

    // Glow halo
    if (glowColor) {
      ctx.save();
      ctx.shadowBlur  = 10;
      ctx.shadowColor = glowColor;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Fill + stroke
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;   ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    const label = node.score !== null
      ? node.score.toFixed(1)
      : (node.pruned ? 'αβ' : (node.isMax ? 'M' : 'm'));

    ctx.fillStyle    = textColor;
    ctx.font         = "500 9px 'JetBrains Mono', monospace";
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  }

  /**
   * Main render function. Call after every minimax run.
   * @param {object[]} nodes  - flat node list from Minimax.run()
   * @param {number}   depth  - search depth (determines row count)
   */
  function render(nodes, depth) {
    const canvas = document.getElementById('treeCanvas');
    const wrap   = canvas.parentElement;
    canvas.width  = wrap.clientWidth;
    canvas.height = wrap.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!nodes || nodes.length === 0) return;

    const W   = canvas.width;
    const H   = canvas.height;
    const pos = computePositions(nodes, W, H, depth);

    // Draw edges first (behind nodes)
    nodes.forEach((n, i) => {
      if (n.parentIdx == null || !pos[n.parentIdx] || !pos[i]) return;
      ctx.beginPath();
      ctx.moveTo(pos[n.parentIdx].x, pos[n.parentIdx].y);
      ctx.lineTo(pos[i].x, pos[i].y);
      ctx.strokeStyle = n.pruned ? COLORS.edgePruned : COLORS.edgeNormal;
      ctx.lineWidth   = n.pruned ? 1 : 1.2;
      ctx.stroke();
    });

    // Draw nodes on top
    nodes.forEach((n, i) => {
      if (!pos[i]) return;
      drawNode(ctx, pos[i].x, pos[i].y, n);
    });
  }

  /** Clear the canvas. */
  function clear() {
    const canvas = document.getElementById('treeCanvas');
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return { render, clear };
})();

// Re-render on window resize to keep canvas sharp
window.addEventListener('resize', () => {
  if (window._lastTreeNodes) {
    TreeRenderer.render(window._lastTreeNodes, window._lastTreeDepth || 3);
  }
});

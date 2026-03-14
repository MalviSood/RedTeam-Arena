/* ═══════════════════════════════════════════════
   minimax.js — adversarial search engine
   Implements minimax with alpha-beta pruning.
   Returns the built node list + search statistics.
   ═══════════════════════════════════════════════ */

const Minimax = (() => {

  /**
   * Heuristic leaf evaluator.
   * Returns a score in range [-10, +10].
   * Positive = good for attacker (MAX), negative = good for defender (MIN).
   */
  function evaluate() {
    return Math.round((Math.random() * 20 - 10) * 10) / 10;
  }

  /**
   * Recursive minimax with alpha-beta pruning.
   *
   * @param {string[]} moves     - remaining moves to branch on
   * @param {number}   depth     - remaining search depth
   * @param {boolean}  isMax     - true if current node is maximizer (attacker)
   * @param {number}   alpha     - best score MAX can guarantee so far
   * @param {number}   beta      - best score MIN can guarantee so far
   * @param {object[]} nodeList  - flat list of all nodes (mutated in place)
   * @param {number|null} parentIdx - index of parent node in nodeList
   * @param {number}   pruneCount - running pruned-branch counter
   * @returns {{ score, nodes, pruned }}
   */
  function search(moves, depth, isMax, alpha, beta, nodeList, parentIdx, pruneCount) {
    // ── Terminal node ──
    if (depth === 0 || moves.length === 0) {
      const score = evaluate();
      nodeList.push({ parentIdx, isMax, score, pruned: false, terminal: true });
      return { score, nodes: 1, pruned: pruneCount };
    }

    // ── Internal node ──
    const myIdx = nodeList.length;
    nodeList.push({ parentIdx, isMax, score: null, pruned: false, terminal: false });

    let best       = isMax ? -Infinity : Infinity;
    let totalNodes = 1;
    const branchCount = Math.min(moves.length, 3); // branching factor = 3

    for (let i = 0; i < branchCount; i++) {
      // Alpha-beta cutoff check before expanding child
      if (isMax && alpha >= beta) {
        pruneCount++;
        nodeList.push({ parentIdx: myIdx, isMax: !isMax, score: null, pruned: true, terminal: false });
        continue;
      }
      if (!isMax && beta <= alpha) {
        pruneCount++;
        nodeList.push({ parentIdx: myIdx, isMax: !isMax, score: null, pruned: true, terminal: false });
        continue;
      }

      const child = search(
        moves.slice(1), depth - 1, !isMax,
        alpha, beta, nodeList, myIdx, pruneCount
      );

      totalNodes += child.nodes;
      pruneCount  = child.pruned;

      if (isMax) {
        if (child.score > best) best = child.score;
        if (best > alpha)       alpha = best;
      } else {
        if (child.score < best) best = child.score;
        if (best < beta)        beta = best;
      }
    }

    nodeList[myIdx].score = best;
    return { score: best, nodes: totalNodes, pruned: pruneCount };
  }

  /**
   * Public entry point.
   * @param {string[]} moves   - available moves for the scenario
   * @param {number}   depth   - search depth (2, 3, or 4)
   * @returns {{ nodes: object[], stats: { score, totalNodes, pruned } }}
   */
  function run(moves, depth) {
    const nodeList = [];
    const result   = search(moves, depth, true, -Infinity, Infinity, nodeList, null, 0);
    return {
      nodes: nodeList,
      stats: {
        score:      result.score,
        totalNodes: result.nodes,
        pruned:     result.pruned
      }
    };
  }

  return { run };
})();

/* ═══════════════════════════════════════════════
   api.js — Anthropic Claude API integration
   Handles LLM calls for PHANTOM and AEGIS agents.
   ═══════════════════════════════════════════════ */

const API = (() => {

  const ENDPOINT = "https://api.anthropic.com/v1/messages";
  const MODEL    = "claude-sonnet-4-20250514";
  const MAX_TOKENS = 1000;

  // System prompts define each agent's character and role
  const SYSTEM_PROMPTS = {
    attacker: `You are PHANTOM, an offensive AI red-team agent in a cybersecurity simulation. 
You are the MAXIMIZER in a minimax adversarial search — your goal is to find the highest-damage 
attack path through a target system. Be concise, hyper-technical, and clinical. 
Respond in 1-2 sentences maximum. No preamble or sign-off.`,

    defender: `You are AEGIS, a defensive AI blue-team agent in a cybersecurity simulation. 
You are the MINIMIZER in a minimax adversarial search — your goal is to neutralize the attacker's 
moves and minimize total damage. Be concise, hyper-technical, and methodical. 
Respond in 1-2 sentences maximum. No preamble or sign-off.`
  };

  /**
   * Core API call.
   * @param {string} systemPrompt - agent's system prompt
   * @param {string} userPrompt   - the specific round prompt
   * @returns {Promise<string>}   - agent's response text
   */
  async function call(systemPrompt, userPrompt) {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: MAX_TOKENS,
          system:     systemPrompt,
          messages:   [{ role: "user", content: userPrompt }]
        })
      });

      const data = await response.json();
      return data.content?.map(block => block.text || '').join('') || 'No response received.';

    } catch (err) {
      return `Error: ${err.message}`;
    }
  }

  /**
   * PHANTOM's attack narration.
   * @param {number} round     - current round number
   * @param {string} move      - the chosen attack move
   * @param {string} scenario  - scenario name for context
   */
  async function phantomMove(round, move, scenario) {
    const prompt = `Round ${round}. Scenario: ${scenario}. 
Your chosen attack vector: "${move}". 
Describe your attack action and its expected impact on the target system.`;
    return call(SYSTEM_PROMPTS.attacker, prompt);
  }

  /**
   * AEGIS's defense narration.
   * @param {number} round      - current round number
   * @param {string} atkMove    - the attack move PHANTOM used
   * @param {string} defMove    - AEGIS's chosen countermeasure
   * @param {string} scenario   - scenario name for context
   */
  async function aegisMove(round, atkMove, defMove, scenario) {
    const prompt = `Round ${round}. Scenario: ${scenario}. 
Attacker deployed: "${atkMove}". 
Your countermeasure: "${defMove}". 
Describe your defensive action and how it neutralizes the attack.`;
    return call(SYSTEM_PROMPTS.defender, prompt);
  }

  return { phantomMove, aegisMove };
})();

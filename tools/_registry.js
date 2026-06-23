/* ============================================================
   EzTrack – Tool Registry
   Loads tool definitions from definitions.json, lazily loads
   handler modules, filters by tier, and dispatches execution.
   ============================================================ */

const path = require('path');
const DEFINITIONS = require('./definitions.json');
const HANDLER_CACHE = {};

function loadHandler(name) {
  if (HANDLER_CACHE[name]) return HANDLER_CACHE[name];
  try {
    HANDLER_CACHE[name] = require('./' + name + '.js');
  } catch (e) {
    HANDLER_CACHE[name] = {};
  }
  return HANDLER_CACHE[name];
}

/* Returns OpenAI-compatible tool definitions filtered by the user's tier */
function getToolDefs(tier) {
  return DEFINITIONS
    .filter(t => t.tiers.includes(tier))
    .map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
}

/* Returns a plain-text bullet list of available tools (for the system prompt) */
function getToolListText(tier) {
  return DEFINITIONS
    .filter(t => t.tiers.includes(tier))
    .map(t => '- ' + t.name + ': ' + t.description)
    .join('\n');
}

/* Executes a single tool call; returns a result object */
function execute(name, args, ctx) {
  const def = DEFINITIONS.find(t => t.name === name);
  if (!def) return { error: 'Unknown tool: ' + name };
  if (!def.tiers.includes(ctx.tier)) return { error: 'Tool ' + name + ' is not available on your tier' };
  const mod = loadHandler(def.handler);
  if (typeof mod[name] !== 'function') return { error: 'Tool ' + name + ' has no handler' };
  return mod[name](args, ctx);
}

module.exports = { getToolDefs, getToolListText, execute };

/* ============================================================
   EzTrack – AI API Proxy Server
   Serves static files + proxies /api/chat to any OpenAI-compatible
   endpoint. Zero npm dependencies — uses only Node.js built-ins.
   ============================================================ */

const http = require('http');
const fs   = require('fs');
const path = require('path');

/* ── Tool registry ── */
let TOOL_REGISTRY;
try { TOOL_REGISTRY = require('./tools/_registry.js'); } catch { TOOL_REGISTRY = null; }

/* ── Root directory (one level up from backend/) ── */
const ROOT_DIR = path.resolve(__dirname, '..');

/* ── Read .env ── */
const env = {};
try {
  const lines = fs.readFileSync(path.join(ROOT_DIR, '.env'), 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key) env[key] = val;
  }
} catch { /* .env missing — LLM calls will fail, static serving still works */ }

const LLM_API_KEY           = env.OPENAI_API_KEY || '';
const LLM_API_URL           = env.LLM_API_URL   || 'https://api.openai.com/v1/chat/completions';
const LLM_MODEL             = env.LLM_MODEL     || 'gpt-4o-mini';
const LLM_REASONING_EFFORT  = env.LLM_REASONING_EFFORT || '';
const LLM_MAX_TOKENS        = parseInt(env.LLM_MAX_TOKENS) || 4096;
let LLM_EXTRA_BODY          = {};
try { if (env.LLM_EXTRA_BODY) LLM_EXTRA_BODY = JSON.parse(env.LLM_EXTRA_BODY); } catch {}

/* ── MIME types ── */
const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.woff2':'font/woff2','.wasm':'application/wasm',
};

/* ── System prompt template (loaded from backend/system-prompt.txt) ── */
let SYSTEM_PROMPT_TEMPLATE = '';
try {
  SYSTEM_PROMPT_TEMPLATE = fs.readFileSync(path.join(__dirname, 'system-prompt.txt'), 'utf-8');
} catch {
  SYSTEM_PROMPT_TEMPLATE = 'You are EzTrack AI, a financial assistant for Filipino SMB owners.\nAnswer based on this data:\n{{txSummary}}';
}

function buildSystemPrompt(ctx, tier) {
  const net = (ctx.weeklyIncome || 0) - (ctx.weeklyExpenses || 0);
  const txSummary = (ctx.recentTransactions || [])
    .map(t => `  ${t.date} ${t.type === 'inc' ? '+' : '-'}₱${t.amt} — ${t.desc}`).join('\n');
  const toolList = TOOL_REGISTRY ? TOOL_REGISTRY.getToolListText(tier || 'simula') : '(no tools available)';

  return SYSTEM_PROMPT_TEMPLATE
    .replace('{{bizName}}', ctx.bizName || 'Unnamed Business')
    .replace('{{tier}}', ctx.tier || 'simula')
    .replace('{{weeklyIncome}}', (ctx.weeklyIncome || 0).toLocaleString())
    .replace('{{weeklyExpenses}}', (ctx.weeklyExpenses || 0).toLocaleString())
    .replace('{{netSign}}', net >= 0 ? '+' : '')
    .replace('{{netAmount}}', Math.abs(net).toLocaleString())
    .replace('{{netTrend}}', net >= 0
      ? 'Positive — you are earning more than you spend.'
      : 'Negative — expenses have exceeded income this week.')
    .replace('{{topCategory}}', ctx.topCategory || 'N/A')
    .replace('{{topCategoryAmount}}', (ctx.topCategoryAmount || 0).toLocaleString())
    .replace('{{cashToday}}', (ctx.cashToday || 0).toLocaleString())
    .replace('{{txSummary}}', txSummary || '  No recent transactions logged.')
    .replace('{{toolList}}', toolList);
}

/* ── Call the upstream LLM (stateless helper) ── */
async function callLLM(messages, tools) {
  const reqBody = {
    model: LLM_MODEL,
    messages,
    max_tokens: LLM_MAX_TOKENS,
    ...(LLM_REASONING_EFFORT ? { reasoning_effort: LLM_REASONING_EFFORT } : {}),
    ...(tools && tools.length ? { tools, tool_choice: 'auto' } : {}),
    ...LLM_EXTRA_BODY,
  };
  const apiRes = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LLM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqBody),
  });
  let data;
  try { data = await apiRes.json(); } catch { data = null; }
  if (!apiRes.ok) {
    console.error('Upstream API error:', apiRes.status, data ? JSON.stringify(data).slice(0, 300) : 'non-json');
    return null;
  }
  return data;
}

/* ── The multi-round tool loop ── */
async function chatLoop(messages, ctx, tier, maxRounds) {
  const systemPrompt = buildSystemPrompt(ctx, tier);
  const toolDefs = TOOL_REGISTRY ? TOOL_REGISTRY.getToolDefs(tier) : [];

  let msgs = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  for (let round = 0; round < maxRounds; round++) {
    const result = await callLLM(msgs, toolDefs);
    if (!result) return { reply: '', error: 'LLM request failed' };

    const choice = result.choices?.[0];
    if (!choice) return { reply: '', error: 'No response from LLM' };

    const msg = choice.message;

    if (choice.finish_reason === 'stop' || !msg.tool_calls) {
      return { reply: msg.content || '' };
    }

    /* Handle tool calls */
    msgs.push({ role: 'assistant', content: msg.content || null, tool_calls: msg.tool_calls });

    for (const tc of msg.tool_calls) {
      let funcResult;
      try {
        const args = JSON.parse(tc.function.arguments);
        funcResult = TOOL_REGISTRY ? TOOL_REGISTRY.execute(tc.function.name, args, ctx) : { error: 'Registry unavailable' };
      } catch (e) {
        funcResult = { error: e.message };
      }
      msgs.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(funcResult) });
    }
  }

  return { reply: 'I could not complete that request in the available steps. Please try again.' };
}

/* ── HTTP server ── */
const server = http.createServer((req, res) => {
  /* CORS */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  /* ── POST /api/chat ── */
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { messages, context, tier: reqTier } = JSON.parse(body);
        const ctx = context || {};
        const tier = ctx.tier || reqTier || 'simula';
        ctx.mutations = [];  /* collects write operations for the frontend to apply */

        const result = await chatLoop(messages || [], ctx, tier, 5);
        if (result.error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: result.error }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            choices: [{ message: { content: result.reply } }],
            mutations: ctx.mutations.length ? ctx.mutations : undefined,
          }));
        }
      } catch (err) {
        console.error('Server error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  /* ── Static file serving ── */
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(ROOT_DIR, filePath);

  /* Prevent directory traversal */
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403); res.end();
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`EzTrack — http://localhost:${PORT}`);
  if (!LLM_API_KEY) console.log('⚠️  No OPENAI_API_KEY in .env — LLM calls will fail.');
});

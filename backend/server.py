import os
import json
import httpx
from pathlib import Path
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from . import database as db
from .tools.registry import get_tool_defs, get_tool_list_text, execute

db.init_db()

app = FastAPI(title="EzTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── LLM config ──
LLM_API_KEY = os.getenv("OPENAI_API_KEY", "")
LLM_API_URL = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "4096"))

# ── System prompt template ──
PROMPT_PATH = Path(__file__).parent / "system-prompt.txt"
SYSTEM_PROMPT_TEMPLATE = PROMPT_PATH.read_text(encoding="utf-8") if PROMPT_PATH.exists() else ""

def build_system_prompt(ctx: dict, tier: str):
    net = (ctx.get("weeklyIncome") or 0) - (ctx.get("weeklyExpenses") or 0)
    tx_summary = "\n".join(
        f"  {t['date']} {'+' if t['type']=='inc' else '-'}₱{t['amt']} -- {t['desc']}"
        for t in (ctx.get("recentTransactions") or [])
    )
    tool_list = get_tool_list_text(tier)
    return (
        SYSTEM_PROMPT_TEMPLATE
        .replace("{{bizName}}", ctx.get("bizName") or "Unnamed Business")
        .replace("{{tier}}", tier)
        .replace("{{weeklyIncome}}", f"{ctx.get('weeklyIncome') or 0:,.0f}")
        .replace("{{weeklyExpenses}}", f"{ctx.get('weeklyExpenses') or 0:,.0f}")
        .replace("{{netSign}}", "+" if net >= 0 else "")
        .replace("{{netAmount}}", f"{abs(net):,.0f}")
        .replace("{{netTrend}}", "Positive -- you are earning more than you spend." if net >= 0 else "Negative -- expenses have exceeded income this week.")
        .replace("{{topCategory}}", ctx.get("topCategory") or "N/A")
        .replace("{{topCategoryAmount}}", f"{ctx.get('topCategoryAmount') or 0:,.0f}")
        .replace("{{cashToday}}", f"{ctx.get('cashToday') or 0:,.0f}")
        .replace("{{txSummary}}", tx_summary or "  No recent transactions logged.")
        .replace("{{toolList}}", tool_list)
    )

async def call_llm(messages: list, tools: list):
    body = {
        "model": LLM_MODEL,
        "messages": messages,
        "max_tokens": LLM_MAX_TOKENS,
    }
    if tools:
        body["tools"] = tools
        body["tool_choice"] = "auto"
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            LLM_API_URL,
            headers={"Authorization": f"Bearer {LLM_API_KEY}", "Content-Type": "application/json"},
            json=body,
        )
        if not resp.is_success:
            print(f"Upstream API error: {resp.status_code} {resp.text[:300]}")
            return None
        return resp.json()

async def chat_loop(messages: list, ctx: dict, tier: str, max_rounds: int = 5):
    system_prompt = build_system_prompt(ctx, tier)
    tool_defs = get_tool_defs(tier)
    msgs = [{"role": "system", "content": system_prompt}] + messages
    conn = db.get_conn()

    for _ in range(max_rounds):
        result = await call_llm(msgs, tool_defs)
        if not result:
            return {"reply": "", "error": "LLM request failed"}
        choice = result.get("choices", [{}])[0]
        msg = choice.get("message", {})
        if choice.get("finish_reason") == "stop" or not msg.get("tool_calls"):
            return {"reply": msg.get("content") or ""}
        msgs.append({"role": "assistant", "content": msg.get("content"), "tool_calls": msg["tool_calls"]})
        for tc in msg["tool_calls"]:
            try:
                func_args = json.loads(tc["function"]["arguments"])
                func_result = execute(tc["function"]["name"], func_args, conn, ctx)
            except Exception as e:
                func_result = {"error": str(e)}
            msgs.append({"role": "tool", "tool_call_id": tc["id"], "content": json.dumps(func_result)})

    return {"reply": "I could not complete that request in the available steps. Please try again."}

# ── REST Endpoints ──

@app.get("/api/profiles")
def list_profiles():
    conn = db.get_conn()
    profiles = db.get_profiles(conn)
    conn.close()
    return profiles

@app.post("/api/login/{profile_id}")
def login(profile_id: int):
    conn = db.get_conn()
    state = db.load_state(conn, profile_id)
    conn.close()
    if not state:
        raise HTTPException(404, "Profile not found")
    return state

@app.post("/api/register")
def register(data: dict):
    conn = db.get_conn()
    profile_id = db.create_profile(conn, data)
    state = db.load_state(conn, profile_id)
    conn.close()
    return state

@app.put("/api/profile")
def update_profile(data: dict):
    profile_id = data.get("profileId")
    if not profile_id:
        raise HTTPException(400, "profileId required")
    fields = {k: v for k, v in data.items() if k != "profileId" and v is not None}
    conn = db.get_conn()
    db.update_profile(conn, profile_id, fields)
    conn.close()
    return {"ok": True}

@app.get("/api/transactions")
def list_transactions(profile_id: int):
    conn = db.get_conn()
    txs = db.get_transactions(conn, profile_id)
    conn.close()
    return txs

@app.post("/api/transactions")
def add_transaction(data: dict):
    conn = db.get_conn()
    tx_id = db.add_transaction(conn, data)
    conn.close()
    return {"id": tx_id}

@app.delete("/api/transactions/{tx_id}")
def remove_transaction(tx_id: int):
    conn = db.get_conn()
    db.delete_transaction(conn, tx_id)
    conn.close()
    return {"ok": True}

@app.get("/api/inventory")
def list_inventory(profile_id: int):
    conn = db.get_conn()
    items = db.get_inventory(conn, profile_id)
    conn.close()
    return items

@app.post("/api/inventory")
def add_inventory(data: dict):
    conn = db.get_conn()
    item_id = db.add_inventory_item(conn, data)
    conn.close()
    return {"id": item_id}

@app.get("/api/customers")
def list_customers(profile_id: int):
    conn = db.get_conn()
    customers = db.get_customers(conn, profile_id)
    conn.close()
    return customers

@app.post("/api/customers")
def add_customer(data: dict):
    conn = db.get_conn()
    cust_id = db.add_customer(conn, data)
    conn.close()
    return {"id": cust_id}

@app.get("/api/goals")
def list_goals(profile_id: int):
    conn = db.get_conn()
    goals = db.get_goals(conn, profile_id)
    conn.close()
    return goals

@app.post("/api/goals")
def add_goal(data: dict):
    conn = db.get_conn()
    goal_id = db.add_goal(conn, data)
    conn.close()
    return {"id": goal_id}

@app.post("/api/chat")
async def chat(data: dict):
    messages = data.get("messages", [])
    ctx = data.get("context", {})
    tier = ctx.get("tier") or data.get("tier", "simula")
    result = await chat_loop(messages, ctx, tier, 5)
    if result.get("error"):
        raise HTTPException(500, result["error"])
    return {"choices": [{"message": {"content": result["reply"]}}]}

@app.post("/api/refresh/{profile_id}")
def refresh(profile_id: int):
    conn = db.get_conn()
    state = db.load_state(conn, profile_id)
    conn.close()
    if not state:
        raise HTTPException(404, "Profile not found")
    return state

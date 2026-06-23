/* ============================================================
   EzTrack – Application State
   Single source of truth for the entire app.
   In a real app this would persist to a backend / SQLite.
   ============================================================ */

const STATE = {
  profileId: null,
  user: null,
  biz:  null,
  tier: 'simula',
  billing: 'monthly',
  currentTab: 'home',
  txType: 'inc',
  transactions: [],
  nextTxId: 1,
  inventory: [],
  simulaQueriesRemaining: 10,
};

/* Weekly bar-chart data (replace with computed values in production) */
const WEEKDATA = [
  { day:'Mon', inc:820,  exp:440 },
  { day:'Tue', inc:560,  exp:320 },
  { day:'Wed', inc:1020, exp:580 },
  { day:'Thu', inc:740,  exp:200 },
  { day:'Fri', inc:1240, exp:650 },
  { day:'Sat', inc:980,  exp:340 },
  { day:'Sun', inc:660,  exp:110 },
];

/* Tier display metadata */
const TIER_META = {
  simula: { label:'Simula – Free',    color:'#4ADE80' },
  sigla:  { label:'Sigla – ₱249/mo', color:'#60A5FA' },
  unlad:  { label:'Unlad – ₱699/mo', color:'#FBBF24' },
};

/* Plan definitions (used by plan picker page) */
const PLANS = [
  {
    id:'simula',
    nameLabel:'FREE TIER', tier:'Simula',
    tagline:'"Just help me track my money."',
    monthly:0, annual:0,
    badge:'Free Forever', badgeCls:'free-badge', nameCls:'free',
    features:[
      'Income & expense tracking via Telegram',
      'Weekly Heartbeat (AI financial pulse)',
      'Basic inventory (up to 150 items)',
      'Daily cash summary in Taglish / English',
      'Simple overspending alert',
      '1 business profile',
      'Offline logging with cloud sync',
      'Self-serve help center',
      'Limited AI queries (10/month)',
    ],
    notIncluded:['Expense categories','Monthly reports','Invoice generator','Unlimited AI chat','Tax tools'],
  },
  {
    id:'sigla',
    nameLabel:'GROWTH TIER', tier:'Sigla',
    tagline:'"I need to know where my money goes."',
    monthly:299, annual:3580,
    badge:'Most Popular', badgeCls:'', nameCls:'',
    features:[
      'Everything in Simula',
      'Daily + on-demand Heartbeat',
      'Expense categories & breakdown chart',
      'Monthly AI-written financial report',
      'Best & worst performing days',
      'Invoice & receipt generator (PDF/image)',
      'Basic customer records',
      'AI chat assistant',
      'Email support',
      '2 business profiles',
    ],
    notIncluded:['Tax tools / BIR reminders','Payroll tracker','Cash flow forecast','Multi-user access'],
  },
  {
    id:'unlad',
    nameLabel:'PRIME TIER', tier:'Unlad',
    tagline:'"I have staff. I need tax tools & forecasts."',
    monthly:699, annual:6990,
    badge:'Best Value', badgeCls:'', nameCls:'enterprise',
    features:[
      'Everything in Sigla',
      'Proactive alerts (no waiting for weekly summary)',
      'Goal setting with AI monitoring',
      '30-day cash flow forecast',
      'P&L report (monthly & quarterly)',
      'Branded invoices + AR tracker',
      'Basic payroll tracker',
      'BIR quarterly deadline reminders',
      '3% percentage tax awareness',
      'Multi-user access (Owner + Staff roles)',
      '5 business profiles',
      'Chat support',
    ],
    notIncluded:[],
  },
];

/* AI conversation history (session-scoped) */
const AI_CHAT = {
  messages: [
    {
      role:'ai',
      text:"Kamusta! I've been watching your finances. This week you earned <strong>₱6,020</strong> and spent <strong>₱1,200</strong> on supplies. Net: <strong>₱4,820</strong>. Maganda! Anything you want to check?",
      ts:'8:02 AM',
    },
  ],
};

/* Keyword-response map for the demo AI */
const AI_RESPONSES = {
  'can i afford to restock':  "Based on your cash position (₱2,340 available) and usual restock cost of ₱480–₱620, yes — you can afford it. Best to order Thursday before your weekend sales spike. 👍",
  'how much did i spend':     "Last week your total expenses were ₱1,200. Breakdown: Supplies ₱820, Utilities ₱380. That's 20% lower than the week before. 📉",
  'which category is highest':"Supplies is your #1 expense category this month at ₱3,200 (41% of total expenses). Consider bulk ordering to reduce per-unit cost.",
  'am i earning or losing':   "You're earning! Net this week: +₱4,820. Net this month so far: +₱10,630. You're on a positive trend for 3 consecutive weeks. 🎉",
  'can i restock this week':  "Yes! Your cash position supports a restock. Based on your history, a full restock costs around ₱580. Go for it before Friday — your best sales day.",
  'can i afford to hire':     "Based on your current net margins (₱10,630/month) and typical daily-rate staff cost (₱400–₱450/day), you can support 1 part-time staff member. Just watch your monthly cost vs. your ₱50K goal.",
  'am i on track for my goal':"You're at 76% (₱38,000 of ₱50,000). You need ₱12,000 more in 12 days. That's ₱1,000/day in net earnings — doable based on your recent daily average of ₱1,120.",
  'forecast next 30 days':    "Based on the last 3 months, your projected July income is ₱22,000–₱26,000. Main risk: Supplies costs have been trending up 8% month-over-month.",
  'bir deadline status':      "Your next BIR quarterly deadline is July 25. Estimated 3% percentage tax based on current revenue: ₱1,150. I've set aside a reminder for July 20.",
  'p&l this month':           "June P&L — Revenue: ₱61,200 · COGS: ₱28,400 · Operating Expenses: ₱9,200 · Net Profit: ₱23,600. That's a 38.6% net margin — very healthy for an SMB!",
};

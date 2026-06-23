/* ============================================================
   EzTrack – Core Tools (all tiers)
   list_transactions, list_inventory, get_insight_card,
   check_overspending
   ============================================================ */

module.exports = {
  /* ── View recent transactions ── */
  list_transactions(args, ctx) {
    const txs = (ctx.recentTransactions || []).slice(0, args.limit || 10);
    if (!txs.length) return { message: 'No transactions found.' };
    return {
      message: 'Here are your recent transactions:',
      transactions: txs.map(t => ({
        id: t.id, type: t.type === 'inc' ? 'Income' : 'Expense',
        description: t.desc, amount: '₱' + t.amt,
        date: t.date, category: t.cat || '—',
      })),
    };
  },

  /* ── View inventory items ── */
  list_inventory(args, ctx) {
    const items = ctx.inventory || [];
    if (!items.length) return { message: 'No inventory items found.' };
    return {
      message: 'Here is your current inventory:',
      items: items.map(i => ({
        id: i.id, name: i.name, quantity: i.qty + ' ' + i.unit,
        min_threshold: i.min_threshold || 0,
        status: i.qty <= 0 ? 'Out of stock' : i.min_threshold && i.qty < i.min_threshold ? 'Low stock' : 'OK',
      })),
    };
  },

  /* ── Weekly Taglish insight card ── */
  get_insight_card(args, ctx) {
    const txs = ctx.recentTransactions || [];
    const expTxs = txs.filter(t => t.type === 'exp');
    const incTxs = txs.filter(t => t.type === 'inc');

    const totalExp = expTxs.reduce((s, t) => s + t.amt, 0);
    const totalInc = incTxs.reduce((s, t) => s + t.amt, 0);

    const catTotals = {};
    expTxs.filter(t => t.cat).forEach(t => { catTotals[t.cat] = (catTotals[t.cat] || 0) + t.amt; });
    let topCat = '', topAmt = 0;
    for (const [c, a] of Object.entries(catTotals)) { if (a > topAmt) { topCat = c; topAmt = a; } }

    if (!totalExp && !totalInc) {
      return { message: 'Wala pang transactions ngayong linggo. Mag-log na para makita ang insight! 📝' };
    }

    let insight;
    if (topCat) {
      insight = `Ang pinakamalaking gastos mo ngayong linggo ay **${topCat} — ₱${topAmt.toLocaleString()}**`;
      const prevExp = (ctx.prevExpenses || totalExp * 1.1);
      insight += totalExp < prevExp
        ? `. Mas mababa ito vs last week (₱${prevExp.toLocaleString()}). Maganda ang trend!`
        : `. Medyo mas mataas ito vs last week (₱${prevExp.toLocaleString()}).`;
    } else {
      insight = (totalInc >= totalExp)
        ? `Kumita ka ng **₱${totalInc.toLocaleString()}** at gumastos ng **₱${totalExp.toLocaleString()}** ngayong linggo. Net: **+₱${(totalInc - totalExp).toLocaleString()}**. Keep it up! 🔥`
        : `Gumastos ka ng **₱${totalExp.toLocaleString()}** vs kita na **₱${totalInc.toLocaleString()}** ngayong linggo. Time to check your spending.`;
    }
    return { message: insight };
  },

  /* ── Overspending check ── */
  check_overspending(args, ctx) {
    const totalInc = ctx.weeklyIncome || 0;
    const totalExp = ctx.weeklyExpenses || 0;
    if (totalExp > totalInc) {
      return {
        alert: true,
        message: `⚠️ Overspending Alert! Ang gastos mo (₱${totalExp.toLocaleString()}) ay lumampas sa kita mo (₱${totalInc.toLocaleString()}) ngayong linggo. Subukan mong bawasan ang hindi importanteng gastos.`,
        overspendAmount: totalExp - totalInc,
      };
    }
    return {
      alert: false,
      message: `✅ Good news! Ang kita mo (₱${totalInc.toLocaleString()}) ay mas mataas sa gastos mo (₱${totalExp.toLocaleString()}) ngayong linggo.`,
    };
  },
};

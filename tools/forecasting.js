/* ============================================================
   EzTrack – Forecasting Tools (Unlad)
   forecast_cashflow
   ============================================================ */

module.exports = {
  forecast_cashflow(args, ctx) {
    const txs = ctx.recentTransactions || [];
    const incTxs = txs.filter(t => t.type === 'inc');
    const expTxs = txs.filter(t => t.type === 'exp');

    const avgDailyInc = incTxs.length ? Math.round(incTxs.reduce((s, t) => s + t.amt, 0) / 7) : 0;
    const avgDailyExp = expTxs.length ? Math.round(expTxs.reduce((s, t) => s + t.amt, 0) / 7) : 0;
    const cashNow = ctx.cashToday || 0;
    const projected30 = cashNow + (avgDailyInc - avgDailyExp) * 30;

    return {
      message: 'Based on your recent 7-day pattern, here is your 30-day cash flow forecast:',
      forecast: {
        currentCash: '₱' + cashNow.toLocaleString(),
        avgDailyIncome: '₱' + avgDailyInc.toLocaleString(),
        avgDailyExpenses: '₱' + avgDailyExp.toLocaleString(),
        projected30Days: '₱' + projected30.toLocaleString(),
        trend: projected30 >= cashNow ? 'Increasing 📈' : 'Decreasing 📉',
      },
      note: projected30 < 0
        ? '⚠️ At current pace, you may run out of cash within 30 days. Consider reducing expenses or increasing sales.'
        : 'Your cash position looks stable based on current trends.',
    };
  },
};

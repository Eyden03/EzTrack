/* ============================================================
   EzTrack – Goal Tools (Unlad)
   set_financial_goal, check_goal_progress
   ============================================================ */

module.exports = {
  set_financial_goal(args, ctx) {
    if (!args.name || !args.target_amt || !args.deadline) {
      return { error: 'Missing required fields: name, target_amt, deadline' };
    }
    ctx.mutations.push({
      action: 'set_financial_goal',
      data: { name: args.name, target_amt: args.target_amt, deadline: args.deadline },
    });
    return { success: true, message: 'Goal set: ' + args.name + ' (₱' + args.target_amt.toLocaleString() + ' by ' + args.deadline + ')' };
  },

  check_goal_progress(args, ctx) {
    const goals = ctx.goals || [];
    if (!goals.length) return { message: 'No goals set yet. Try setting one with set_financial_goal!' };

    const totalNet = (ctx.weeklyIncome || 0) - (ctx.weeklyExpenses || 0);
    return {
      message: 'Here is your goal progress:',
      goals: goals.map(g => ({
        name: g.name,
        target: '₱' + g.target_amt.toLocaleString(),
        deadline: g.deadline,
        currentNet: '₱' + totalNet.toLocaleString(),
        progress: g.target_amt > 0 ? Math.min(100, Math.round((totalNet / g.target_amt) * 100)) + '%' : '0%',
        remaining: '₱' + Math.max(0, g.target_amt - totalNet).toLocaleString(),
      })),
    };
  },
};

/* ============================================================
   EzTrack – Transaction Tools (Sigla+)
   add_transaction, delete_transaction
   ============================================================ */

module.exports = {
  add_transaction(args, ctx) {
    if (!args.type || !args.desc || !args.amt) {
      return { error: 'Missing required fields: type, desc, amt' };
    }
    const tx = {
      type: args.type,
      desc: args.desc,
      amt: args.amt,
      date: new Date().toISOString().split('T')[0],
      cat: args.cat || '',
      time: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
    };
    ctx.mutations.push({ action: 'add_transaction', data: tx });
    return {
      success: true,
      message: 'Transaction added: ' + (args.type === 'inc' ? 'Income' : 'Expense') + ' — ₱' + args.amt + ' (' + args.desc + ')',
    };
  },

  delete_transaction(args, ctx) {
    if (!args.id) return { error: 'Missing transaction id' };
    ctx.mutations.push({ action: 'delete_transaction', data: { id: args.id } });
    return { success: true, message: 'Transaction #' + args.id + ' deleted.' };
  },
};

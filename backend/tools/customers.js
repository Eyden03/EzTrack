/* ============================================================
   EzTrack – Customer Tools (Sigla+)
   add_customer
   ============================================================ */

module.exports = {
  add_customer(args, ctx) {
    if (!args.name || !args.contact) {
      return { error: 'Missing required fields: name, contact' };
    }
    ctx.mutations.push({
      action: 'add_customer',
      data: { name: args.name, contact: args.contact },
    });
    return { success: true, message: 'Customer added: ' + args.name };
  },
};

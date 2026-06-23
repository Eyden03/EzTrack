/* ============================================================
   EzTrack – Inventory Tools (Sigla+)
   add_inventory_item, set_stock_threshold
   ============================================================ */

module.exports = {
  add_inventory_item(args, ctx) {
    if (!args.name || args.qty === undefined || !args.unit) {
      return { error: 'Missing required fields: name, qty, unit' };
    }
    ctx.mutations.push({
      action: 'add_inventory_item',
      data: {
        name: args.name,
        qty: parseInt(args.qty) || 0,
        unit: args.unit,
        min_threshold: parseInt(args.min_threshold) || 0,
      },
    });
    return { success: true, message: 'Item added: ' + args.name + ' (' + args.qty + ' ' + args.unit + ')' };
  },

  set_stock_threshold(args, ctx) {
    if (!args.item_id || args.min_threshold === undefined) {
      return { error: 'Missing required fields: item_id, min_threshold' };
    }
    ctx.mutations.push({
      action: 'set_stock_threshold',
      data: { item_id: args.item_id, min_threshold: parseInt(args.min_threshold) },
    });
    return { success: true, message: 'Threshold set to ' + args.min_threshold + ' for item #' + args.item_id };
  },
};

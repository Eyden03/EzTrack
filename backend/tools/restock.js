/* ============================================================
   EzTrack – Restock Tools (Unlad)
   check_restock_needs
   ============================================================ */

module.exports = {
  check_restock_needs(args, ctx) {
    const items = ctx.inventory || [];
    const needsRestock = items.filter(i => i.min_threshold > 0 && i.qty < i.min_threshold);
    const outOfStock = items.filter(i => i.qty <= 0);

    if (!needsRestock.length && !outOfStock.length) {
      return { message: 'All inventory items are adequately stocked. No restock needed right now.' };
    }

    const result = [];
    needsRestock.forEach(i => {
      result.push({ name: i.name, current: i.qty + ' ' + i.unit, min: i.min_threshold, need: (i.min_threshold - i.qty) + ' ' + i.unit });
    });
    outOfStock.filter(i => !needsRestock.includes(i)).forEach(i => {
      result.push({ name: i.name, current: 'Out of stock', min: i.min_threshold || 0, need: i.min_threshold + ' ' + i.unit });
    });

    return {
      message: 'Items needing restock:',
      items: result,
      tip: 'Consider ordering before your peak sales days (Friday and Saturday) to avoid stockouts.',
    };
  },
};

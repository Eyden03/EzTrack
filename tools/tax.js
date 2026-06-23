/* ============================================================
   EzTrack – Tax Tools (Unlad)
   check_tax_deadlines
   ============================================================ */

module.exports = {
  check_tax_deadlines(args, ctx) {
    const now = new Date();
    const year = now.getFullYear();
    const deadlines = [
      { quarter: 'Q1 (Jan–Mar)', deadline: 'May 25, ' + year, status: now > new Date(year, 4, 25) ? 'Past' : 'Upcoming' },
      { quarter: 'Q2 (Apr–Jun)', deadline: 'August 25, ' + year, status: now > new Date(year, 7, 25) ? 'Past' : 'Upcoming' },
      { quarter: 'Q3 (Jul–Sep)', deadline: 'November 25, ' + year, status: now > new Date(year, 10, 25) ? 'Past' : 'Upcoming' },
      { quarter: 'Q4 (Oct–Dec)', deadline: 'February 25, ' + (year + 1), status: now > new Date(year + 1, 1, 25) ? 'Past' : 'Upcoming' },
    ];

    const totalInc = ctx.weeklyIncome || 0;
    const estTax = totalInc * 0.03;

    return {
      message: 'Here are your BIR quarterly deadline reminders for non-VAT registered businesses:',
      deadlines,
      estimatedQuarterlyTax: '₱' + Math.round(estTax).toLocaleString() + ' (3% percentage tax based on current revenue)',
      note: 'These are estimates. Please consult a bookkeeper or BIR for exact filing requirements.',
    };
  },
};

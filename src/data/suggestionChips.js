import { CONFIG } from '@/config'

export function getSuggestionChips(tier) {
  const chips = []

  const readGroup = [
    { label: '📊 View my transactions', msg: 'Show my recent transactions' },
    { label: '💰 Am I earning or losing?', msg: 'Am I earning or losing?' },
    { label: '📦 Check my inventory', msg: 'Show my inventory items' },
    { label: '⚠️ Am I overspending?', msg: 'Check if I am overspending' },
  ]
  chips.push({ label: 'Ask about your money', chips: readGroup })

  if (tier === CONFIG.TIERS.SIGLA) {
    const manageGroup = [
      { label: '➕ Add packaging expense', msg: 'Add a transaction for 340 pesos packaging materials expense' },
      { label: '🏪 Add customer Crisanta', msg: 'Add a customer named Crisanta Reyes with contact 09171234567' },
      { label: '📋 Set stock alert on phone cases', msg: 'Set stock threshold to 5 for phone cases' },
    ]
    chips.push({ label: 'Manage your business', chips: manageGroup })
  }

  if (tier === CONFIG.TIERS.UNLAD) {
    const manageGroup = [
      { label: '➕ Add payroll expense', msg: 'Add a transaction for 3200 pesos staff salary expense' },
      { label: '🏪 Add customer Alyssa', msg: 'Add a customer named Alyssa Fernandez with contact 09171239876' },
      { label: '📋 Set stock alert on sneakers', msg: 'Set stock threshold to 3 for sneakers' },
    ]
    chips.push({ label: 'Manage your business', chips: manageGroup })
  }

  if (tier === CONFIG.TIERS.SIMULA) {
    const docGroup = [
      { label: '🧾 Generate a receipt', msg: 'Generate a receipt for 2 kg Jasmine Rice at P50 each and 1L Coconut Cooking Oil at P120, paid in cash' },
    ]
    chips.push({ label: 'Generate documents', chips: docGroup })
  }

  if (tier === CONFIG.TIERS.SIGLA) {
    const docGroup = [
      { label: '🧾 Receipt for phone cases', msg: 'Generate a receipt for Crisanta Reyes: 2 phone cases at P150 each and 1 tote bag at P350, paid via GCash' },
      { label: '📄 Invoice for keychains', msg: 'Create an invoice for Mark Villanueva: 20 keychains at P45 each and 10 laptop sleeves at P380 each, payment due in 7 days via GCash' },
      { label: '📈 Weekly sales report', msg: 'Generate a weekly report. Sales P22,920 expenses P5,415. Marketing spent P1,000. Categories: Supplies P3,600 (66%), Marketing P1,000 (18%), Shipping P395 (7%). Write summary in Taglish and give 2 tips.' },
    ]
    chips.push({ label: 'Generate documents', chips: docGroup })
  }

  if (tier === CONFIG.TIERS.UNLAD) {
    const docGroup = [
      { label: '🧾 Receipt for clothing', msg: 'Generate a receipt for Alyssa Fernandez: 2 t-shirts at P350 each and 1 pair denim jeans at P950, paid via GCash' },
      { label: '📄 Invoice for polo shirts', msg: 'Create an invoice for Rodrigo Tan: 10 polo shirts at P450 each and 5 caps at P180 each, payment due in 15 days via Bank Transfer' },
      { label: '📈 Weekly sales report', msg: 'Generate a weekly report. Sales P57,640 expenses P44,540. Payroll P9,600 rent P12,000. Categories: Supplies P19,850 (45%), Payroll P9,600 (22%), Rent P12,000 (27%). Write summary in Taglish and give 2 tips.' },
    ]
    chips.push({ label: 'Generate documents', chips: docGroup })
  }

  if (tier === CONFIG.TIERS.UNLAD) {
    const planGroup = [
      { label: '🎯 Set a goal to save ₱50K', msg: 'Set a financial goal to save 50000 pesos by December' },
      { label: '📈 Forecast my cash flow', msg: 'What is my 30-day cash flow forecast?' },
      { label: '🧾 Check BIR tax deadlines', msg: 'Check my BIR tax deadlines' },
      { label: '📦 What needs restocking?', msg: 'What items need restocking?' },
      { label: '📊 Monthly P&L report', msg: 'Generate a monthly P&L report for June. Gross sales P61,200, COGS P28,400, operating expenses P9,200, net profit P23,600. Categories: Supplies 45%, Labor 26%, Utilities 11%, Rent 11%, Marketing 7%.' },
    ]
    chips.push({ label: 'Plan ahead', chips: planGroup })
  }

  return chips
}

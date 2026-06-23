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

  if (tier === CONFIG.TIERS.SIGLA || tier === CONFIG.TIERS.UNLAD) {
    const manageGroup = [
      { label: '➕ Add ₱500 supplies expense', msg: 'Add a transaction for 500 pesos supplies expense' },
      { label: '🏪 Add customer Juan', msg: 'Add a customer named Juan with contact 09171234567' },
      { label: '📋 Set stock alert on noodles', msg: 'Set stock threshold to 15 for noodles' },
    ]
    chips.push({ label: 'Manage your business', chips: manageGroup })
  }

  if (tier === CONFIG.TIERS.UNLAD) {
    const planGroup = [
      { label: '🎯 Set a goal to save ₱50K', msg: 'Set a financial goal to save 50000 pesos by December' },
      { label: '📈 Forecast my cash flow', msg: 'What is my 30-day cash flow forecast?' },
      { label: '🧾 Check BIR tax deadlines', msg: 'Check my BIR tax deadlines' },
      { label: '📦 What needs restocking?', msg: 'What items need restocking?' },
    ]
    chips.push({ label: 'Plan ahead', chips: planGroup })
  }

  return chips
}

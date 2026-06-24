import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import LogTransactionModal from '@/components/modals/LogTransactionModal'
import AddItemModal from '@/components/modals/AddItemModal'
import AddCustomerModal from '@/components/modals/AddCustomerModal'
import AddGoalModal from '@/components/modals/AddGoalModal'

const TYPES = [
  { key: 'transaction', label: 'Log Transaction', tier: ['simula', 'sigla', 'unlad'], icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { key: 'inventory', label: 'Inventory Item', tier: ['simula', 'sigla', 'unlad'], icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { key: 'customer', label: 'Add Customer', tier: ['sigla', 'unlad'], icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  { key: 'goal', label: 'Set Goal', tier: ['unlad'], icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
]

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function AddMenu() {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const tier = useApp().state.tier

  function handleSelect(type) {
    setSelectedType(type)
    setOpen(false)
  }

  function handleClose(which) {
    if (selectedType === which) setSelectedType(null)
  }

  const visibleTypes = TYPES.filter(t => t.tier.includes(tier))

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button className="relative -top-3 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all ring-4 ring-white">
            <PlusIcon />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Add New</DrawerTitle></DrawerHeader>
          <div className="px-4 pb-6 space-y-1">
            {visibleTypes.map(t => (
              <button
                key={t.key}
                onClick={() => handleSelect(t.key)}
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                    <path d={t.icon} />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-800">{t.label}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-4 h-4 ml-auto"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <LogTransactionModal
        open={selectedType === 'transaction'}
        onOpenChange={(v) => { if (!v) handleClose('transaction') }}
      />
      <AddItemModal
        open={selectedType === 'inventory'}
        onOpenChange={(v) => { if (!v) handleClose('inventory') }}
      />
      {tier !== CONFIG.TIERS.SIMULA && (
        <AddCustomerModal
          open={selectedType === 'customer'}
          onOpenChange={(v) => { if (!v) handleClose('customer') }}
        />
      )}
      {tier === CONFIG.TIERS.UNLAD && (
        <AddGoalModal
          open={selectedType === 'goal'}
          onOpenChange={(v) => { if (!v) handleClose('goal') }}
        />
      )}
    </>
  )
}

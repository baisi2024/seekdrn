'use client'

interface ViewToggleProps {
  view: 'grid' | 'list'
  onChange: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onChange('grid')}
        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
          view === 'grid' ? 'bg-[#0066FF] border-[#0066FF] text-white' : 'border-white/[0.06] bg-[#1A1F2E] text-white/40 hover:text-white'
        }`}
        title="Grid View"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      </button>
      <button
        onClick={() => onChange('list')}
        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
          view === 'list' ? 'bg-[#0066FF] border-[#0066FF] text-white' : 'border-white/[0.06] bg-[#1A1F2E] text-white/40 hover:text-white'
        }`}
        title="List View"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>
      </button>
    </div>
  )
}

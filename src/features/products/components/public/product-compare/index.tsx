'use client'

import { useProductStore } from '@/features/products/stores'
import { CompareTable } from './compare-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ProductCompareProps {
  open?: boolean
  onClose?: () => void
}

export function ProductCompare({ open, onClose }: ProductCompareProps) {
  const { compareList, compareResults, removeFromCompare, clearCompare } = useProductStore()

  if (compareList.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Compare Products ({compareList.length})</DialogTitle>
            <Button variant="outline" size="sm" onClick={clearCompare}>
              Clear All
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <CompareTable
            products={compareResults}
            onRemove={removeFromCompare}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

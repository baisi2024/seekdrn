'use client'

import { useState, useEffect } from 'react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { AdminPage } from '@/components/admin/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { MultilingualInput } from '@/features/products/components/admin/multilingual-input'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface FAQ {
  id: string
  category: string
  question: Record<string, string>
  answer: Record<string, string>
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

const EMPTY_FAQ = {
  category: '',
  question: {},
  answer: {},
  sort_order: 0,
  published: true,
}

export default function FAQsPage() {
  const t = useAdminTranslations()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<Partial<FAQ>>(EMPTY_FAQ)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (categoryFilter) params.set('category', categoryFilter)
        const res = await fetch(`/api/admin/faqs?${params.toString()}`)
        const result = await res.json()
        if (res.ok && !cancelled) {
          setFaqs(result.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch FAQs:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [categoryFilter])

  async function fetchFaqs() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.set('category', categoryFilter)
      const res = await fetch(`/api/admin/faqs?${params.toString()}`)
      const result = await res.json()
      if (res.ok) {
        setFaqs(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingFAQ({ ...EMPTY_FAQ, question: {}, answer: {} })
    setEditingId(null)
    setDialogOpen(true)
  }

  function openEditDialog(faq: FAQ) {
    setEditingFAQ({ ...faq })
    setEditingId(faq.id)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/faqs/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingFAQ),
        })
        if (!res.ok) throw new Error('Failed to update')
        toast.success(t('faqs_page.saveSuccess'))
      } else {
        const res = await fetch('/api/admin/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingFAQ),
        })
        if (!res.ok) throw new Error('Failed to create')
        toast.success(t('faqs_page.createSuccess'))
      }
      setDialogOpen(false)
      fetchFaqs()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success(t('faqs_page.deleteSuccess'))
      setDeleteConfirmId(null)
      fetchFaqs()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(t('faqs_page.deleteFailed'))
    }
  }

  const categories = [...new Set(faqs.map((f) => f.category).filter(Boolean))]

  if (loading) return <div className="p-8">{t('loading')}</div>

  return (
    <AdminPage
      title="faqs_page.title"
      actions={
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {t('faqs_page.add')}
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('')}
          >
            {t('faqs_page.allCategories')}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* FAQ List */}
        {faqs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t('faqs_page.noFaqs')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {faq.category && (
                        <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                      )}
                      <Badge variant={faq.published ? 'default' : 'secondary'} className="text-xs">
                        {faq.published ? t('published') : t('draft')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{faq.sort_order}</span>
                    </div>
                    <p className="font-medium truncate">
                      {faq.question.en || faq.question.zh || t('faqs_page.untitled')}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {faq.answer.en || faq.answer.zh || ''}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(faq)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(faq.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t('faqs_page.edit') : t('faqs_page.add')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('faqs_page.category')}</Label>
              <Input
                value={editingFAQ.category || ''}
                onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                placeholder={t('faqs_page.categoryPlaceholder')}
              />
            </div>
            <MultilingualInput
              label={t('faqs_page.question')}
              value={editingFAQ.question || {}}
              onChange={(v) => setEditingFAQ({ ...editingFAQ, question: v })}
              type="textarea"
            />
            <MultilingualInput
              label={t('faqs_page.answer')}
              value={editingFAQ.answer || {}}
              onChange={(v) => setEditingFAQ({ ...editingFAQ, answer: v })}
              type="textarea"
            />
            <div>
              <Label>{t('sort_order')}</Label>
              <Input
                type="number"
                value={editingFAQ.sort_order || 0}
                onChange={(e) => setEditingFAQ({ ...editingFAQ, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingFAQ.published ?? true}
                onCheckedChange={(v) => setEditingFAQ({ ...editingFAQ, published: v })}
              />
              <Label>{t('published')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('faqs_page.deleteConfirm')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('faqs_page.deleteConfirmMessage')}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}

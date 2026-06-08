'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { toast } from 'sonner'
import { ArrowLeft, Send, User } from 'lucide-react'

interface InquiryNote {
  id: string
  inquiry_id: string
  content: string
  created_by: string | null
  created_at: string
}

interface InquiryData {
  id: string
  full_name: string
  company: string
  email: string
  phone: string
  country: string
  application_interest: string
  product_interest: string
  intent: string
  source_page: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  compliance_status: string
  follow_up_status: string
  sales_person: string
  message: string
  created_at: string
  updated_at: string
  notes: InquiryNote[]
}

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['contacted', 'closed_lost'],
  contacted: ['qualified', 'closed_lost'],
  qualified: ['closed_won', 'closed_lost'],
  closed_won: [],
  closed_lost: ['pending'],
}

const STATUS_LABELS: Record<string, { zh: string; en: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { zh: '待处理', en: 'Pending', variant: 'secondary' },
  contacted: { zh: '已联系', en: 'Contacted', variant: 'default' },
  qualified: { zh: '已认证', en: 'Qualified', variant: 'default' },
  closed_won: { zh: '已成交', en: 'Closed Won', variant: 'default' },
  closed_lost: { zh: '已流失', en: 'Closed Lost', variant: 'destructive' },
}

const COMPLIANCE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  approved: 'default',
  review_required: 'secondary',
  blocked: 'destructive',
}

export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useAdminTranslations()
  const [loading, setLoading] = useState(true)
  const [inquiry, setInquiry] = useState<InquiryData | null>(null)
  const [newNote, setNewNote] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [salesPerson, setSalesPerson] = useState('')

  useEffect(() => {
    async function loadInquiry() {
      try {
        const res = await fetch(`/api/admin/inquiries/${params.id}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setInquiry(data)
        setSalesPerson(data.sales_person || '')
      } catch (error) {
        console.error('Load error:', error)
        toast.error(t('saveFailed'))
      } finally {
        setLoading(false)
      }
    }

    loadInquiry()
  }, [params.id, t])

  async function handleStatusChange(newStatus: string) {
    if (!inquiry) return
    setSavingStatus(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ follow_up_status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const data = await res.json()
      setInquiry(data)
      toast.success(t('inquiries_page.statusUpdated'))
    } catch (error) {
      console.error('Status update error:', error)
      toast.error(t('saveFailed'))
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleAddNote() {
    if (!inquiry || !newNote.trim()) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: { content: newNote.trim() } }),
      })
      if (!res.ok) throw new Error('Failed to add note')
      const data = await res.json()
      setInquiry(data)
      setNewNote('')
      toast.success(t('inquiries_page.noteAdded'))
    } catch (error) {
      console.error('Note add error:', error)
      toast.error(t('saveFailed'))
    } finally {
      setSavingNote(false)
    }
  }

  async function handleSaveSalesPerson() {
    if (!inquiry) return
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales_person: salesPerson }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const data = await res.json()
      setInquiry(data)
      toast.success(t('inquiries_page.salesPersonUpdated'))
    } catch (error) {
      console.error('Sales person update error:', error)
      toast.error(t('saveFailed'))
    }
  }

  if (loading) return <div className="p-8">{t('loading')}</div>
  if (!inquiry) return <div className="p-8">{t('noResults')}</div>

  const currentStatus = inquiry.follow_up_status || 'pending'
  const availableStatuses = STATUS_FLOW[currentStatus] || []
  const complianceVariant = COMPLIANCE_VARIANTS[inquiry.compliance_status] || 'outline'

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/inquiries')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('cancel')}
          </Button>
          <h1 className="text-2xl font-bold">
            {t('inquiries_page.detail')} - {inquiry.full_name}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('inquiries_page.contactInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('name')}</Label>
                  <p className="font-medium">{inquiry.full_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('company')}</Label>
                  <p className="font-medium">{inquiry.company || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('inquiries_page.email')}</Label>
                  <p className="font-medium">{inquiry.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('inquiries_page.phone')}</Label>
                  <p className="font-medium">{inquiry.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('country')}</Label>
                  <p className="font-medium">{inquiry.country || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('inquiries_page.intent')}</Label>
                  <p className="font-medium">{inquiry.intent || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interest Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('inquiries_page.interestInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('application')}</Label>
                  <p className="font-medium">{inquiry.application_interest || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('inquiries_page.productInterest')}</Label>
                  <p className="font-medium">{inquiry.product_interest || '-'}</p>
                </div>
              </div>
              {inquiry.message && (
                <div>
                  <Label className="text-muted-foreground">{t('inquiries_page.message')}</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md text-sm">{inquiry.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Source & UTM */}
          <Card>
            <CardHeader>
              <CardTitle>{t('inquiries_page.sourceInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('inquiries_page.sourcePage')}</Label>
                  <p className="font-medium text-sm">{inquiry.source_page || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">UTM Source</Label>
                  <p className="font-medium text-sm">{inquiry.utm_source || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">UTM Medium</Label>
                  <p className="font-medium text-sm">{inquiry.utm_medium || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">UTM Campaign</Label>
                  <p className="font-medium text-sm">{inquiry.utm_campaign || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{t('inquiries_page.notes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inquiry.notes && inquiry.notes.length > 0 ? (
                <div className="space-y-3">
                  {inquiry.notes.map((note) => (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {note.created_by || t('inquiries_page.system')}
                          {' · '}
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('inquiries_page.noNotes')}</p>
              )}

              <div className="space-y-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t('inquiries_page.notePlaceholder')}
                  rows={3}
                />
                <Button onClick={handleAddNote} disabled={savingNote || !newNote.trim()} size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  {savingNote ? t('saving') : t('inquiries_page.addNote')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Status & Actions */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t('status')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_LABELS[currentStatus]?.variant || 'outline'}>
                  {STATUS_LABELS[currentStatus]?.[t('language_switcher.chinese') ? 'zh' : 'en'] || currentStatus}
                </Badge>
              </div>

              {availableStatuses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('inquiries_page.changeStatus')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableStatuses.map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(status)}
                        disabled={savingStatus}
                      >
                        {STATUS_LABELS[status]?.[t('language_switcher.chinese') ? 'zh' : 'en'] || status}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>{t('compliance_field')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={complianceVariant}>
                {inquiry.compliance_status}
              </Badge>
            </CardContent>
          </Card>

          {/* Sales Person */}
          <Card>
            <CardHeader>
              <CardTitle>{t('inquiries_page.salesPerson')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={salesPerson}
                onChange={(e) => setSalesPerson(e.target.value)}
                placeholder={t('inquiries_page.salesPersonPlaceholder')}
              />
              <Button onClick={handleSaveSalesPerson} size="sm" variant="outline">
                {t('save')}
              </Button>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>{t('inquiries_page.timestamps')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-muted-foreground text-xs">{t('inquiries_page.createdAt')}</Label>
                <p className="text-sm">{new Date(inquiry.created_at).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">{t('inquiries_page.updatedAt')}</Label>
                <p className="text-sm">{new Date(inquiry.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import type { ProductDocument, DocumentType } from '@/features/products/types'
import { DOCUMENT_TYPE_LABELS } from '@/features/products/types'
import { LOCALES } from '@/lib/constants/locales'

const DOCUMENT_TYPES: DocumentType[] = ['manual', 'datasheet', 'certificate', 'brochure', 'other']

interface DocumentsTabProps {
  productId: string
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsTab({ productId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<ProductDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<{
    type: DocumentType
    file_url: string
    language: string
    translations: Record<string, { title: string; description?: string }>
  }>({
    type: 'manual',
    file_url: '',
    language: 'en',
    translations: {
      en: { title: '', description: '' },
      zh: { title: '', description: '' },
    },
  })
  const supabase = createClient()

  useEffect(() => {
    async function loadDocuments() {
      try {
        const { data, error } = await supabase
          .from('product_documents')
          .select('*')
          .eq('product_id', productId)
          .order('sort_order')

        if (error) throw error
        setDocuments(data as ProductDocument[])
      } catch (error) {
        console.error('Failed to load documents:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDocuments()
  }, [productId, supabase])

  const openAddDialog = () => {
    setFormData({
      type: 'manual',
      file_url: '',
      language: 'en',
      translations: {
        en: { title: '', description: '' },
        zh: { title: '', description: '' },
      },
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('product_documents')
        .insert([{
          product_id: productId,
          type: formData.type,
          file_url: formData.file_url,
          language: formData.language,
          translations: formData.translations,
          sort_order: documents.length,
        }])
        .select()
        .single()

      if (error) throw error
      setDocuments((prev) => [...prev, data as ProductDocument])
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to create document:', error)
      alert('Failed to create document')
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const { error } = await supabase
        .from('product_documents')
        .delete()
        .eq('id', docId)

      if (error) throw error
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert('Failed to delete document')
    }
  }

  if (loading) {
    return <div>Loading documents...</div>
  }

  const groupedDocuments = DOCUMENT_TYPES.reduce((acc, type) => {
    acc[type] = documents.filter((d) => d.type === type)
    return acc
  }, {} as Record<DocumentType, ProductDocument[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openAddDialog}>Add Document</Button>
      </div>

      {DOCUMENT_TYPES.map((type) => {
        const docs = groupedDocuments[type]
        if (docs.length === 0) return null

        return (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">{DOCUMENT_TYPE_LABELS[type].en}</Badge>
                <span className="text-muted-foreground">({docs.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {doc.translations.en?.title || 'Untitled'}
                        </span>
                        {doc.language && (
                          <Badge variant="secondary">{doc.language.toUpperCase()}</Badge>
                        )}
                      </div>
                      {doc.translations.en?.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {doc.translations.en.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{doc.file_type || 'Unknown type'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<a href={doc.file_url} target="_blank" rel="noopener noreferrer" />}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {documents.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No documents yet. Click &quot;Add Document&quot; to upload one.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Document Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as DocumentType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {DOCUMENT_TYPE_LABELS[type].en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData({ ...formData, language: value ?? '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="multi">Multilingual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>File URL</Label>
              <Input
                value={formData.file_url}
                onChange={(e) =>
                  setFormData({ ...formData, file_url: e.target.value })
                }
                placeholder="https://example.com/document.pdf"
              />
            </div>

            {LOCALES.map((locale) => (
              <div key={locale.code} className="space-y-2">
                <Label className="text-sm font-medium">
                  Title ({locale.label})
                </Label>
                <Input
                  value={formData.translations[locale.code]?.title || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        [locale.code]: {
                          ...formData.translations[locale.code],
                          title: e.target.value,
                        },
                      },
                    })
                  }
                />
                <Label className="text-sm font-medium">
                  Description ({locale.label})
                </Label>
                <Textarea
                  value={formData.translations[locale.code]?.description || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        [locale.code]: {
                          ...formData.translations[locale.code],
                          description: e.target.value,
                        },
                      },
                    })
                  }
                  rows={2}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

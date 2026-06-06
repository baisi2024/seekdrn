'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import type { ProductFAQ, FAQFormData } from '@/features/products/types'

const LOCALES = ['en', 'zh'] as const

interface FAQTabProps {
  productId: string
}

export function FAQTab({ productId }: FAQTabProps) {
  const [faqs, setFaqs] = useState<Record<string, ProductFAQ[]>>({})
  const [loading, setLoading] = useState(true)
  const [currentLocale, setCurrentLocale] = useState<string>('en')
  const [editingFAQ, setEditingFAQ] = useState<ProductFAQ | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<FAQFormData>({ question: '', answer: '' })
  const supabase = createClient()

  useEffect(() => {
    async function loadFAQs() {
      try {
        const { data, error } = await supabase
          .from('product_faqs')
          .select('*')
          .eq('product_id', productId)
          .order('sort_order')

        if (error) throw error

        const faqMap: Record<string, ProductFAQ[]> = {}
        LOCALES.forEach((locale) => {
          faqMap[locale] = (data as ProductFAQ[])?.filter((f) => f.locale === locale) || []
        })
        setFaqs(faqMap)
      } catch (error) {
        console.error('Failed to load FAQs:', error)
      } finally {
        setLoading(false)
      }
    }
    loadFAQs()
  }, [productId, supabase])

  const openAddDialog = () => {
    setEditingFAQ(null)
    setFormData({ question: '', answer: '' })
    setIsDialogOpen(true)
  }

  const openEditDialog = (faq: ProductFAQ) => {
    setEditingFAQ(faq)
    setFormData({ question: faq.question, answer: faq.answer })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingFAQ) {
        const { data, error } = await supabase
          .from('product_faqs')
          .update({ question: formData.question, answer: formData.answer })
          .eq('id', editingFAQ.id)
          .select()
          .single()

        if (error) throw error

        setFaqs((prev) => ({
          ...prev,
          [currentLocale]: prev[currentLocale].map((f) =>
            f.id === editingFAQ.id ? (data as ProductFAQ) : f
          ),
        }))
      } else {
        const currentFaqs = faqs[currentLocale] || []
        const { data, error } = await supabase
          .from('product_faqs')
          .insert([{
            product_id: productId,
            locale: currentLocale,
            question: formData.question,
            answer: formData.answer,
            sort_order: currentFaqs.length,
          }])
          .select()
          .single()

        if (error) throw error

        setFaqs((prev) => ({
          ...prev,
          [currentLocale]: [...(prev[currentLocale] || []), data as ProductFAQ],
        }))
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save FAQ:', error)
      alert('Failed to save FAQ')
    }
  }

  const handleDelete = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      const { error } = await supabase
        .from('product_faqs')
        .delete()
        .eq('id', faqId)

      if (error) throw error

      setFaqs((prev) => ({
        ...prev,
        [currentLocale]: prev[currentLocale].filter((f) => f.id !== faqId),
      }))
    } catch (error) {
      console.error('Failed to delete FAQ:', error)
      alert('Failed to delete FAQ')
    }
  }

  if (loading) {
    return <div>Loading FAQs...</div>
  }

  const currentFAQs = faqs[currentLocale] || []

  return (
    <div className="space-y-6">
      <Tabs value={currentLocale} onValueChange={setCurrentLocale}>
        <TabsList>
          {LOCALES.map((locale) => (
            <TabsTrigger key={locale} value={locale}>
              {locale.toUpperCase()} ({faqs[locale]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map((locale) => (
          <TabsContent key={locale} value={locale}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>FAQs ({locale.toUpperCase()})</CardTitle>
                  <Button onClick={openAddDialog}>Add FAQ</Button>
                </div>
              </CardHeader>
              <CardContent>
                {currentFAQs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No FAQs yet. Click &quot;Add FAQ&quot; to create one.
                  </p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {currentFAQs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span>{faq.question}</span>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(faq)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(faq.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingFAQ ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

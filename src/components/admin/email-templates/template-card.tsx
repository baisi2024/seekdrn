'use client'

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit, Trash2, Eye, Mail, GripVertical, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState, memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EmailTemplate } from '../email-templates-table'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

interface TemplateCardProps {
  template: EmailTemplate
  onDelete: (id: string) => void
  isDragging?: boolean
}

export const TemplateCard = memo(function TemplateCard({ 
  template, 
  onDelete,
  isDragging = false,
}: TemplateCardProps) {
  const t = useAdminTranslations()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // 拖拽功能
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: template.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(template.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <Card 
        className={`
          relative overflow-hidden
          shadow-lg hover:shadow-xl
          hover:border-primary/50
          transition-all duration-300 ease-out
          ${isSortableDragging ? 'rotate-2 scale-105 shadow-2xl' : ''}
          ${isDragging ? 'opacity-50' : ''}
        `}
        role="article"
        aria-label={`${t('email_templates_page.title')}: ${template.template_key}`}
      >
        {/* 拖拽手柄 */}
        <button
          {...attributes}
          {...listeners}
          className="absolute left-2 top-5 p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label={t('email_templates_page.title')}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pl-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{template.template_key}</h3>
            {isHovered && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(template.updated_at)}
              </p>
            )}
          </div>
        </div>
        <Badge 
          variant={template.is_active ? 'default' : 'secondary'}
          className={`
            transition-all duration-300
            ${template.is_active ? 'bg-primary' : ''}
          `}
        >
          {template.is_active ? t('email_templates_page.statusActive') : t('email_templates_page.statusInactive')}
        </Badge>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 transition-all duration-300">
          {template.description || t('email_templates_page.noDescription')}
        </p>
        
        {/* 可用变量列表 */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{t('email_templates_page.availableVariables')}</p>
          <div className="flex flex-wrap gap-1">
            <code className="text-xs bg-muted border border-border px-2 py-1 rounded">
              {'{{name}}'}
            </code>
            <code className="text-xs bg-muted border border-border px-2 py-1 rounded">
              {'{{email}}'}
            </code>
            <code className="text-xs bg-muted border border-border px-2 py-1 rounded">
              {'{{link}}'}
            </code>
          </div>
        </div>
        
        {/* 悬停时显示额外信息 */}
        {isHovered && (
          <div className="mt-3 pt-3 border-t border-dashed animate-fade-in">
            <p className="text-xs text-muted-foreground">
              {`${t('email_templates_page.templateKeyLabel')}:`} <code className="bg-muted px-1 rounded">{template.id}</code>
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t pt-3 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          {t('email_templates_page.updatedAt')} {formatDate(template.updated_at)}
        </p>
        
        <div className="flex items-center gap-1">
          <Link 
            href={`/admin/email-templates/${template.template_key}`}
            aria-label={`${t('edit')} ${template.template_key}`}
          >
            <Button 
              size="icon-sm" 
              variant="ghost" 
              title={t('edit')}
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </Link>
          
          <Button 
            size="icon-sm" 
            variant="ghost" 
            title={t('email_templates_page.preview')}
            className="hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={t('email_templates_page.preview')}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          
          <Dialog>
            <DialogTrigger
              render={
                <button
                  type="button"
                  title={t('delete')}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={t('delete')}
                />
              }
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('email_templates_page.confirmDelete')}</DialogTitle>
                <DialogDescription>
                  {t('email_templates_page.deleteConfirmMessage').replace('{key}', template.template_key)}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" disabled={isDeleting}>
                  {t('cancel')}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? t('email_templates_page.deleting') : t('delete')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
      </Card>
    </div>
  )
})
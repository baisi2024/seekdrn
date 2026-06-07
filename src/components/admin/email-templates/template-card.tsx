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
    return date.toLocaleDateString('zh-CN', {
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
      {/* 渐变边框效果 */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
      
      <Card 
        className={`
          relative overflow-hidden
          bg-white/80 backdrop-blur-sm
          border-2 border-transparent
          hover:border-purple-500/30
          hover:shadow-2xl hover:shadow-purple-500/10
          transition-all duration-300 ease-out
          ${isSortableDragging ? 'rotate-2 scale-105 shadow-2xl' : ''}
          ${isDragging ? 'opacity-50' : ''}
        `}
        role="article"
        aria-label={`邮件模板: ${template.template_key}`}
      >
        {/* 顶部渐变条 */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        {/* 拖拽手柄 */}
        <button
          {...attributes}
          {...listeners}
          className="absolute left-2 top-5 p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="拖拽排序"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pl-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <Mail className="h-4 w-4 text-blue-600" />
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
            ${template.is_active ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}
          `}
        >
          {template.is_active ? t('email_templates_page.statusActive') : t('email_templates_page.statusInactive')}
        </Badge>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 transition-all duration-300">
          {template.description || t('email_templates_page.noDescription')}
        </p>
        
        {/* 可用变量列表 - 悬停时显示更多 */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{t('email_templates_page.availableVariables')}</p>
          <div className="flex flex-wrap gap-1">
            <code className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 px-2 py-1 rounded transition-all hover:scale-105 hover:shadow-sm cursor-pointer">
              {'{{name}}'}
            </code>
            <code className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 px-2 py-1 rounded transition-all hover:scale-105 hover:shadow-sm cursor-pointer">
              {'{{email}}'}
            </code>
            <code className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 px-2 py-1 rounded transition-all hover:scale-105 hover:shadow-sm cursor-pointer">
              {'{{link}}'}
            </code>
          </div>
        </div>
        
        {/* 悬停时显示额外信息 */}
        {isHovered && (
          <div className="mt-3 pt-3 border-t border-dashed animate-fade-in">
            <p className="text-xs text-muted-foreground">
              模板 ID: <code className="bg-muted px-1 rounded">{template.id}</code>
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t pt-3 bg-gradient-to-r from-muted/30 to-muted/10">
        <p className="text-xs text-muted-foreground">
          {t('email_templates_page.updatedAt')} {formatDate(template.updated_at)}
        </p>
        
        <div className="flex items-center gap-1">
          <Link 
            href={`/admin/email-templates/${template.template_key}`}
            aria-label={`编辑模板 ${template.template_key}`}
          >
            <Button 
              size="icon-sm" 
              variant="ghost" 
              title={t('edit')}
              className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </Link>
          
          <Button 
            size="icon-sm" 
            variant="ghost" 
            title={t('email_templates_page.preview')}
            className="hover:bg-purple-100 hover:text-purple-600 transition-colors"
            aria-label="预览模板"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                title={t('delete')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 hover:bg-red-100 hover:text-red-600"
                aria-label="删除模板"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
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
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
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

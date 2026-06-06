'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Bold, Italic, Underline, Strikethrough, Code,
  List, ListOrdered, CheckSquare,
  Quote, Minus, Link, Image, Table,
  Undo2, Redo2,
  Heading1, Heading2, Heading3,
} from 'lucide-react'
import type { ToolbarConfig } from '@/features/products/types'

interface ToolbarProps {
  editor: Editor
  config?: Partial<ToolbarConfig>
}

export function Toolbar({ editor, config }: ToolbarProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const groups = config?.groups || ['history', 'text', 'heading', 'list', 'block', 'insert']

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  const setImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
    }
    setShowImageDialog(false)
    setImageUrl('')
  }

  return (
    <>
      <div className="flex flex-wrap gap-1 p-2 border border-b-0 rounded-t-lg bg-muted/50">
        {groups.includes('history') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('text') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-muted' : ''}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-muted' : ''}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-muted' : ''}>
              <Underline className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-muted' : ''}>
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'bg-muted' : ''}>
              <Code className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('heading') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}>
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}>
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}>
              <Heading3 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('list') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-muted' : ''}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-muted' : ''}>
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'bg-muted' : ''}>
              <CheckSquare className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('block') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-muted' : ''}>
              <Quote className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-muted' : ''}>
              <Code className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
              <Table className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('insert') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowLinkDialog(true)}>
              <Link className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowImageDialog(true)}>
              <Image className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Enter URL..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
              <Button onClick={setLink}>Insert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Enter image URL..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>Cancel</Button>
              <Button onClick={setImage}>Insert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

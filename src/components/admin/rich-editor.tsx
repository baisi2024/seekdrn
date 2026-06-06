'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table'
import { TableHeader } from '@tiptap/extension-table'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Underline } from '@tiptap/extension-underline'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Quote,
  Minus,
  Search,
  X,
} from 'lucide-react'
import { getPublicUrl } from '@/lib/r2'

interface MediaItem {
  id: string
  filename: string
  r2_key: string
  mime_type: string
}

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const [showMediaDialog, setShowMediaDialog] = useState(false)
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ HTMLAttributes: { class: 'max-w-full h-auto' } }),
      Link.configure({ openOnClick: false }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlock.configure({
        languageClassPrefix: 'language-',
      }),
      Blockquote,
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[200px] p-4 border rounded-b-lg focus:outline-none',
      },
    },
  })

  const fetchMedia = async () => {
    setLoadingMedia(true)
    try {
      const res = await fetch('/api/upload')
      const { media } = await res.json()
      setMediaItems(media)
    } catch (error) {
      console.error('Failed to fetch media:', error)
    }
    setLoadingMedia(false)
  }

  const handleInsertMedia = (item: MediaItem) => {
    if (!editor) return
    const url = getPublicUrl(item.r2_key)
    if (item.mime_type.startsWith('image/')) {
      editor.chain().focus().setImage({ src: url }).run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    setShowMediaDialog(false)
  }

  const handleInsertLink = () => {
    if (!editor || !linkUrl) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  const handleInsertTable = () => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
  }

  const handleInsertHorizontalRule = () => {
    if (!editor) return
    editor.chain().focus().setHorizontalRule().run()
  }

  const filteredMedia = mediaItems.filter((item) =>
    item.filename.toLowerCase().includes(mediaSearch.toLowerCase())
  )

  if (!editor) return null

  return (
    <div>
      <div className="flex flex-wrap gap-1 p-2 border border-b-0 rounded-t-lg bg-muted/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-muted' : ''}
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleInsertTable}>
          <TableIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleInsertHorizontalRule}>
          <Minus className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={() => setShowLinkDialog(true)}>
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setShowMediaDialog(true); fetchMedia() }}>
          <ImageIcon className="w-4 h-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />

      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent className="max-w-3xl max-h-[70vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Insert Media</DialogTitle>
              <button onClick={() => setShowMediaDialog(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {loadingMedia ? (
              <div className="mt-4 p-8 text-center">Loading...</div>
            ) : filteredMedia.length === 0 ? (
              <div className="mt-4 p-8 text-center text-muted-foreground">No media found</div>
            ) : (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleInsertMedia(item)}
                    className="cursor-pointer border rounded-lg overflow-hidden hover:border-primary transition-colors"
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center relative">
                      {item.mime_type.startsWith('image/') ? (
                        <Image
                          src={getPublicUrl(item.r2_key)}
                          alt={item.filename}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                          <ImageIcon className="w-8 h-8" />
                          <span className="text-xs mt-2 truncate max-w-full px-2">{item.filename}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-muted/50">
                      <p className="text-xs truncate">{item.filename}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInsertLink} disabled={!linkUrl}>
                Insert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
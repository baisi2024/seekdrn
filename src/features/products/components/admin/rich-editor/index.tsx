'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Youtube from '@tiptap/extension-youtube'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Toolbar } from './toolbar'
import type { ToolbarConfig } from '@/features/products/types'

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  toolbar?: Partial<ToolbarConfig>
  maxLength?: number
}

export function RichEditor({ content, onChange, placeholder, toolbar, maxLength }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      Highlight,
      TextStyle,
      Color,
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube,
      TaskList,
      TaskItem,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (maxLength && html.length > maxLength) return
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[200px] p-4 border rounded-b-lg focus:outline-none',
      },
    },
  })

  if (!editor) return null

  return (
    <div>
      <Toolbar editor={editor} config={toolbar} />
      <EditorContent editor={editor} />
    </div>
  )
}

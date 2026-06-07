'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table'
import { TableHeader } from '@tiptap/extension-table'
import { Underline } from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { getPublicUrl } from '@/lib/r2'
import { Toolbar } from './toolbar'
import { HtmlMode } from './html-mode'
import type { RichEditorProps, MediaItem, WordCount, EditorMode } from './types'

const DEFAULT_FEATURES = {
  history: true,
  textFormatting: true,
  headings: true,
  lists: true,
  alignment: true,
  blocks: true,
  insert: true,
  tools: true,
  wordCount: true,
}

/**
 * 富文本编辑器主组件
 * 基于Tiptap实现，支持HTML源码模式和全屏模式
 */
export function RichEditor({
  content,
  onChange,
  minHeight = '200px',
  disabled = false,
  features = DEFAULT_FEATURES,
  className,
  onEditorReady,
}: RichEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showMediaDialog, setShowMediaDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [wordCount, setWordCount] = useState<WordCount>({
    characters: 0,
    words: 0,
    paragraphs: 0,
  })

  // 合并功能配置
  const enabledFeatures = useMemo(
    () => ({ ...DEFAULT_FEATURES, ...features }),
    [features]
  )

  // Tiptap编辑器配置
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: enabledFeatures.headings,
        bulletList: enabledFeatures.lists,
        orderedList: enabledFeatures.lists,
        blockquote: enabledFeatures.blocks,
        codeBlock: enabledFeatures.blocks,
        horizontalRule: enabledFeatures.blocks,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      TextStyle,
      Color,
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      updateWordCount(editor)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none p-4 border rounded-b-lg focus:outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className || ''}`,
      },
    },
    editable: !disabled,
  })

  // 更新字数统计
  const updateWordCount = useCallback((editor: typeof editor) => {
    if (!editor) return

    const text = editor.getText()
    const characters = text.length
    const words = text.split(/\s+/).filter((word) => word.length > 0).length
    const paragraphs = editor.storage.paragraph?.length || 0

    setWordCount({ characters, words, paragraphs })
  }, [])

  // 编辑器就绪回调
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
      updateWordCount(editor)
    }
  }, [editor, onEditorReady, updateWordCount])

  // 获取媒体列表
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

  // 插入媒体
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

  // 插入链接
  const handleInsertLink = () => {
    if (!editor || !linkUrl) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  // 插入表格
  const handleInsertTable = () => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
  }

  // 切换HTML模式
  const toggleHtmlMode = () => {
    setMode((prev) => (prev === 'visual' ? 'html' : 'visual'))
  }

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  // 过滤媒体
  const filteredMedia = mediaItems.filter((item) =>
    item.filename.toLowerCase().includes(mediaSearch.toLowerCase())
  )

  if (!editor) return null

  return (
    <div
      className={`
        ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* 全屏标题栏 */}
      {isFullscreen && (
        <div className="flex items-center justify-between p-2 border-b bg-muted">
          <span className="text-sm font-medium">富文本编辑器 - 全屏模式</span>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 编辑器主体 */}
      {mode === 'visual' ? (
        <>
          {/* 工具栏 */}
          <Toolbar
            editor={editor}
            wordCount={wordCount}
            showWordCount={enabledFeatures.wordCount}
            isHtmlMode={false}
            onToggleHtmlMode={toggleHtmlMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onInsertLink={() => setShowLinkDialog(true)}
            onInsertImage={() => {
              setShowMediaDialog(true)
              fetchMedia()
            }}
            onInsertTable={handleInsertTable}
          />
          {/* 编辑区域 */}
          <EditorContent
            editor={editor}
            style={{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : minHeight }}
          />
        </>
      ) : (
        <HtmlMode
          content={content}
          onChange={onChange}
          onSwitchToVisual={toggleHtmlMode}
          minHeight={isFullscreen ? 'calc(100vh - 120px)' : minHeight}
        />
      )}

      {/* 媒体选择对话框 */}
      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent className="max-w-3xl max-h-[70vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>插入媒体</DialogTitle>
              <button
                onClick={() => setShowMediaDialog(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索媒体..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {loadingMedia ? (
              <div className="mt-4 p-8 text-center">加载中...</div>
            ) : filteredMedia.length === 0 ? (
              <div className="mt-4 p-8 text-center text-muted-foreground">未找到媒体</div>
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
                          <span className="text-xs mt-2 truncate max-w-full px-2">
                            {item.filename}
                          </span>
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

      {/* 链接插入对话框 */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>插入链接</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              placeholder="输入链接地址..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                取消
              </Button>
              <Button onClick={handleInsertLink} disabled={!linkUrl}>
                插入
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

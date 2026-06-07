'use client'

import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code2,
  Table,
  Minus,
  Link,
  Image,
  Code as HtmlIcon,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import type { ToolbarConfig, WordCount } from './types'

interface ToolbarProps {
  /** Tiptap编辑器实例 */
  editor: Editor
  /** 字数统计 */
  wordCount?: WordCount
  /** 是否显示字数统计 */
  showWordCount?: boolean
  /** 是否处于HTML模式 */
  isHtmlMode?: boolean
  /** 切换HTML模式 */
  onToggleHtmlMode?: () => void
  /** 是否全屏 */
  isFullscreen?: boolean
  /** 切换全屏 */
  onToggleFullscreen?: () => void
  /** 插入链接 */
  onInsertLink?: () => void
  /** 插入图片 */
  onInsertImage?: () => void
  /** 插入表格 */
  onInsertTable?: () => void
}

/**
 * 富文本编辑器工具栏组件
 * 提供完整的格式化工具和功能按钮
 */
export function Toolbar({
  editor,
  wordCount,
  showWordCount = true,
  isHtmlMode = false,
  onToggleHtmlMode,
  isFullscreen = false,
  onToggleFullscreen,
  onInsertLink,
  onInsertImage,
  onInsertTable,
}: ToolbarProps) {
  // 工具栏配置
  const toolbarConfig: ToolbarConfig = {
    groups: [
      // 历史记录
      {
        id: 'history',
        buttons: [
          {
            id: 'undo',
            icon: Undo2,
            title: '撤销',
            onClick: (editor) => editor.chain().focus().undo().run(),
            isDisabled: (editor) => !editor.can().undo(),
          },
          {
            id: 'redo',
            icon: Redo2,
            title: '重做',
            onClick: (editor) => editor.chain().focus().redo().run(),
            isDisabled: (editor) => !editor.can().redo(),
          },
        ],
      },
      // 文本格式
      {
        id: 'text',
        buttons: [
          {
            id: 'bold',
            icon: Bold,
            title: '加粗',
            onClick: (editor) => editor.chain().focus().toggleBold().run(),
            isActive: (editor) => editor.isActive('bold'),
          },
          {
            id: 'italic',
            icon: Italic,
            title: '斜体',
            onClick: (editor) => editor.chain().focus().toggleItalic().run(),
            isActive: (editor) => editor.isActive('italic'),
          },
          {
            id: 'underline',
            icon: Underline,
            title: '下划线',
            onClick: (editor) => editor.chain().focus().toggleUnderline().run(),
            isActive: (editor) => editor.isActive('underline'),
          },
          {
            id: 'strike',
            icon: Strikethrough,
            title: '删除线',
            onClick: (editor) => editor.chain().focus().toggleStrike().run(),
            isActive: (editor) => editor.isActive('strike'),
          },
          {
            id: 'code',
            icon: Code,
            title: '行内代码',
            onClick: (editor) => editor.chain().focus().toggleCode().run(),
            isActive: (editor) => editor.isActive('code'),
          },
        ],
      },
      // 标题
      {
        id: 'heading',
        buttons: [
          {
            id: 'h1',
            icon: Heading1,
            title: '标题 1',
            onClick: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: (editor) => editor.isActive('heading', { level: 1 }),
          },
          {
            id: 'h2',
            icon: Heading2,
            title: '标题 2',
            onClick: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: (editor) => editor.isActive('heading', { level: 2 }),
          },
          {
            id: 'h3',
            icon: Heading3,
            title: '标题 3',
            onClick: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: (editor) => editor.isActive('heading', { level: 3 }),
          },
        ],
      },
      // 列表
      {
        id: 'list',
        buttons: [
          {
            id: 'bulletList',
            icon: List,
            title: '无序列表',
            onClick: (editor) => editor.chain().focus().toggleBulletList().run(),
            isActive: (editor) => editor.isActive('bulletList'),
          },
          {
            id: 'orderedList',
            icon: ListOrdered,
            title: '有序列表',
            onClick: (editor) => editor.chain().focus().toggleOrderedList().run(),
            isActive: (editor) => editor.isActive('orderedList'),
          },
          {
            id: 'taskList',
            icon: CheckSquare,
            title: '任务列表',
            onClick: (editor) => editor.chain().focus().toggleTaskList().run(),
            isActive: (editor) => editor.isActive('taskList'),
          },
        ],
      },
      // 对齐
      {
        id: 'align',
        buttons: [
          {
            id: 'alignLeft',
            icon: AlignLeft,
            title: '左对齐',
            onClick: (editor) => editor.chain().focus().setTextAlign('left').run(),
            isActive: (editor) => editor.isActive({ textAlign: 'left' }),
          },
          {
            id: 'alignCenter',
            icon: AlignCenter,
            title: '居中',
            onClick: (editor) => editor.chain().focus().setTextAlign('center').run(),
            isActive: (editor) => editor.isActive({ textAlign: 'center' }),
          },
          {
            id: 'alignRight',
            icon: AlignRight,
            title: '右对齐',
            onClick: (editor) => editor.chain().focus().setTextAlign('right').run(),
            isActive: (editor) => editor.isActive({ textAlign: 'right' }),
          },
        ],
      },
      // 块元素
      {
        id: 'block',
        buttons: [
          {
            id: 'blockquote',
            icon: Quote,
            title: '引用',
            onClick: (editor) => editor.chain().focus().toggleBlockquote().run(),
            isActive: (editor) => editor.isActive('blockquote'),
          },
          {
            id: 'codeBlock',
            icon: Code2,
            title: '代码块',
            onClick: (editor) => editor.chain().focus().toggleCodeBlock().run(),
            isActive: (editor) => editor.isActive('codeBlock'),
          },
          {
            id: 'table',
            icon: Table,
            title: '插入表格',
            onClick: () => onInsertTable?.(),
          },
          {
            id: 'horizontalRule',
            icon: Minus,
            title: '分割线',
            onClick: (editor) => editor.chain().focus().setHorizontalRule().run(),
          },
        ],
      },
      // 插入
      {
        id: 'insert',
        buttons: [
          {
            id: 'link',
            icon: Link,
            title: '插入链接',
            onClick: () => onInsertLink?.(),
            isActive: (editor) => editor.isActive('link'),
          },
          {
            id: 'image',
            icon: Image,
            title: '插入图片',
            onClick: () => onInsertImage?.(),
          },
        ],
      },
    ],
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border border-b-0 rounded-t-lg bg-muted/50">
      {/* 工具栏分组 */}
      {toolbarConfig.groups.map((group, groupIndex) => (
        <div key={group.id} className="flex items-center gap-1">
          {group.buttons.map((button) => {
            const Icon = button.icon
            const isActive = button.isActive?.(editor) ?? false
            const isDisabled = button.isDisabled?.(editor) ?? false

            return (
              <Button
                key={button.id}
                variant="ghost"
                size="sm"
                onClick={() => button.onClick(editor)}
                disabled={isDisabled}
                title={button.title}
                className={isActive ? 'bg-muted' : ''}
              >
                <Icon className="w-4 h-4" />
              </Button>
            )
          })}
          {/* 分组分隔线 */}
          {groupIndex < toolbarConfig.groups.length - 1 && (
            <div className="w-px h-6 bg-border mx-1" />
          )}
        </div>
      ))}

      {/* 工具分组 */}
      <div className="w-px h-6 bg-border mx-1" />
      <div className="flex items-center gap-1">
        {/* HTML模式切换 */}
        {onToggleHtmlMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleHtmlMode}
            title={isHtmlMode ? '可视化模式' : 'HTML 源码模式'}
            className={isHtmlMode ? 'bg-muted' : ''}
          >
            <HtmlIcon className="w-4 h-4" />
          </Button>
        )}
        {/* 全屏切换 */}
        {onToggleFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* 字数统计 */}
      {showWordCount && wordCount && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
            <span>字符: {wordCount.characters}</span>
            <span>单词: {wordCount.words}</span>
            <span>段落: {wordCount.paragraphs}</span>
          </div>
        </>
      )}
    </div>
  )
}

import type { Editor } from '@tiptap/react'
import type { LucideIcon } from 'lucide-react'

/**
 * 工具栏按钮配置
 */
export interface ToolbarButton {
  /** 按钮唯一标识 */
  id: string
  /** 图标组件 */
  icon: LucideIcon
  /** 提示文本 */
  title: string
  /** 点击处理函数 */
  onClick: (editor: Editor) => void
  /** 是否激活状态 */
  isActive?: (editor: Editor) => boolean
  /** 是否禁用 */
  isDisabled?: (editor: Editor) => boolean
}

/**
 * 工具栏分组配置
 */
export interface ToolbarGroup {
  /** 分组唯一标识 */
  id: string
  /** 分组内的按钮列表 */
  buttons: ToolbarButton[]
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 工具栏分组列表 */
  groups: ToolbarGroup[]
}

/**
 * 富文本编辑器功能配置
 */
export interface RichEditorFeatures {
  /** 启用历史记录（撤销/重做） */
  history?: boolean
  /** 启用文本格式化（加粗/斜体/下划线等） */
  textFormatting?: boolean
  /** 启用标题 */
  headings?: boolean
  /** 启用列表 */
  lists?: boolean
  /** 启用对齐 */
  alignment?: boolean
  /** 启用块元素（引用/代码块/表格等） */
  blocks?: boolean
  /** 启用插入功能（链接/图片） */
  insert?: boolean
  /** 启用工具（HTML模式/全屏） */
  tools?: boolean
  /** 启用字数统计 */
  wordCount?: boolean
}

/**
 * 媒体项数据
 */
export interface MediaItem {
  /** 媒体ID */
  id: string
  /** 文件名 */
  filename: string
  /** R2存储键 */
  r2_key: string
  /** MIME类型 */
  mime_type: string
}

/**
 * 富文本编辑器属性
 */
export interface RichEditorProps {
  /** 编辑器内容（HTML字符串） */
  content: string
  /** 内容变化回调 */
  onChange: (html: string) => void
  /** 占位符文本 */
  placeholder?: string
  /** 最小高度 */
  minHeight?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 功能配置 */
  features?: RichEditorFeatures
  /** 自定义类名 */
  className?: string
  /** 编辑器创建回调 */
  onEditorReady?: (editor: Editor) => void
}

/**
 * 字数统计信息
 */
export interface WordCount {
  /** 字符数 */
  characters: number
  /** 单词数 */
  words: number
  /** 段落数 */
  paragraphs: number
}

/**
 * 编辑器模式
 */
export type EditorMode = 'visual' | 'html'

/**
 * 全屏状态
 */
export type FullscreenState = boolean

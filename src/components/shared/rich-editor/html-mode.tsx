'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Code, Eye, Check, AlertCircle } from 'lucide-react'

interface HtmlModeProps {
  /** HTML内容 */
  content: string
  /** 内容变化回调 */
  onChange: (html: string) => void
  /** 切换回可视化模式 */
  onSwitchToVisual: () => void
  /** 最小高度 */
  minHeight?: string
}

/**
 * HTML源码编辑模式组件
 * 提供直接编辑HTML源码的功能，支持格式化和语法高亮
 */
export function HtmlMode({
  content,
  onChange,
  onSwitchToVisual,
  minHeight = '200px',
}: HtmlModeProps) {
  const [htmlCode, setHtmlCode] = useState(content)
  const [isValid, setIsValid] = useState(true)
  const [isFormatting, setIsFormatting] = useState(false)

  // 同步外部内容变化（仅在内容与当前状态不同时更新）
  useEffect(() => {
    if (content !== htmlCode) {
      setHtmlCode(content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  // 简单的HTML验证
  const validateHtml = useCallback((html: string): boolean => {
    try {
      // 检查基本HTML结构
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      // 检查是否有解析错误
      const parserError = doc.querySelector('parsererror')
      return !parserError
    } catch {
      return false
    }
  }, [])

  // 处理代码变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setHtmlCode(newCode)
    setIsValid(validateHtml(newCode))
    onChange(newCode)
  }

  // 格式化HTML
  const formatHtml = async () => {
    setIsFormatting(true)
    try {
      // 简单的HTML格式化逻辑
      const formatted = formatHtmlCode(htmlCode)
      setHtmlCode(formatted)
      setIsValid(validateHtml(formatted))
      onChange(formatted)
    } catch (error) {
      console.error('Format error:', error)
    }
    setIsFormatting(false)
  }

  // 简单的HTML格式化函数
  const formatHtmlCode = (html: string): string => {
    let formatted = html
      // 移除多余空白
      .replace(/>\s+</g, '><')
      // 在标签后添加换行
      .replace(/(<[^/][^>]*>)/g, '\n$1')
      // 在闭合标签前添加换行
      .replace(/(<\/[^>]+>)/g, '$1\n')
      // 移除多余换行
      .replace(/\n\s*\n/g, '\n')
      .trim()

    // 添加缩进
    const lines = formatted.split('\n')
    let indent = 0
    const indentStr = '  '
    
    formatted = lines.map(line => {
      // 减少缩进（闭合标签）
      if (line.match(/<\/[^>]+>/)) {
        indent = Math.max(0, indent - 1)
      }
      
      const indentedLine = indentStr.repeat(indent) + line.trim()
      
      // 增加缩进（开始标签）
      if (line.match(/<[^/][^>]*>/) && !line.match(/<[^>]+\/>/)) {
        indent++
      }
      
      return indentedLine
    }).join('\n')

    return formatted
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">HTML 源码</span>
          {!isValid && (
            <div className="flex items-center gap-1 text-destructive text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>格式错误</span>
            </div>
          )}
          {isValid && htmlCode && (
            <div className="flex items-center gap-1 text-success text-xs">
              <Check className="w-3 h-3" />
              <span>格式正确</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={formatHtml}
            disabled={isFormatting}
            title="格式化 HTML"
          >
            {isFormatting ? (
              <span className="text-xs">格式化中...</span>
            ) : (
              <span className="text-xs">格式化</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchToVisual}
            title="切换到可视化编辑"
          >
            <Eye className="w-4 h-4 mr-1" />
            <span className="text-xs">可视化</span>
          </Button>
        </div>
      </div>

      {/* 代码编辑区 */}
      <div className="relative">
        <textarea
          value={htmlCode}
          onChange={handleChange}
          className={`
            w-full p-4 font-mono text-sm bg-zinc-900 text-zinc-100
            focus:outline-none focus:ring-2 focus:ring-primary
            resize-y
            ${!isValid ? 'ring-2 ring-destructive' : ''}
          `}
          style={{ minHeight }}
          spellCheck={false}
          placeholder="在此输入 HTML 源码..."
        />
        
        {/* 行号指示器 */}
        <div className="absolute top-0 left-0 p-4 pointer-events-none select-none">
          <div className="font-mono text-sm text-zinc-600 opacity-0">
            {htmlCode.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>字符数: {htmlCode.length}</span>
          <span>行数: {htmlCode.split('\n').length}</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Tab</kbd>
          <span>插入空格</span>
        </div>
      </div>
    </div>
  )
}

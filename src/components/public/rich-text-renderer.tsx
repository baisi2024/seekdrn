'use client'

import DOMPurify from 'isomorphic-dompurify'

interface RichTextRendererProps {
  content: string
  className?: string
}

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4',
  'p', 'ul', 'ol', 'li',
  'a', 'strong', 'em', 'br', 'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
]

const ALLOWED_ATTR = ['href', 'src', 'alt', 'target', 'rel', 'class']

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  })

  return (
    <div
      className={`prose prose-gray max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

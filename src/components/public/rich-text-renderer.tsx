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
  'blockquote', 'code', 'pre', 'span', 'div',
  'dl', 'dt', 'dd',
  'sub', 'sup',
]

const ALLOWED_ATTR = ['href', 'src', 'alt', 'target', 'rel', 'class', 'style']

// Emoji pattern for stripping
const EMOJI_PATTERN = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2B55}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{200D}]|[\u{20E3}]|[\u{E0020}-\u{E007F}]/gu

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&times;': '×',
    '&mdash;': '—',
    '&ndash;': '–',
    '&le;': '≤',
    '&ge;': '≥',
    '&deg;': '°',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&nbsp;': ' ',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
    '&laquo;': '«',
    '&raquo;': '»',
    '&hellip;': '…',
    '&para;': '',
    '&sect;': '§',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  }
  let result = text
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replaceAll(entity, char)
  }
  // Decode numeric entities instead of deleting them
  result = result.replace(/&#(\d+);/g, (_, code) => {
    const num = parseInt(code)
    return num > 0 ? String.fromCharCode(num) : ''
  })
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
    const num = parseInt(code, 16)
    return num > 0 ? String.fromCharCode(num) : ''
  })
  return result
}

function preprocessContent(html: string): string {
  if (!html) return ''

  let result = html.trim()

  // If content is already HTML (contains tags), clean it
  if (/<[a-z][\s\S]*>/i.test(result)) {
    // Strip emojis from HTML content
    result = result.replace(EMOJI_PATTERN, '')
    // Decode HTML entities within text nodes
    result = decodeHtmlEntities(result)
    return result
  }

  // Plain text content - needs full conversion to HTML
  // 1. Decode HTML entities
  result = decodeHtmlEntities(result)
  // 2. Strip emojis
  result = result.replace(EMOJI_PATTERN, '')
  // 3. Clean up whitespace
  result = result.replace(/\s+/g, ' ').trim()

  if (!result) return ''

  // 4. Split into sentences/paragraphs for better readability
  // Split on patterns like "Title Content" where content is capitalized
  // or on clear sentence boundaries followed by new topics
  const segments = splitIntoSegments(result)

  if (segments.length === 1) {
    return `<p>${segments[0]}</p>`
  }

  return segments.map(s => `<p>${s}</p>`).join('\n')
}

function splitIntoSegments(text: string): string[] {
  // Try splitting on double newlines first
  const doubleNewlineParts = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0)
  if (doubleNewlineParts.length > 1) {
    return doubleNewlineParts
  }

  // For single-paragraph text, try to split on sentence boundaries
  // that indicate topic changes (e.g., after a period followed by a capitalized word
  // that starts a new concept)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  // Group sentences into paragraphs of 2-3 sentences
  const paragraphs: string[] = []
  let current = ''

  for (const sentence of sentences) {
    current += sentence
    // Create a paragraph break after every 2-3 sentences
    if (current.length > 150 && current.match(/[.!?]/g)?.length && current.length >= 2) {
      paragraphs.push(current.trim())
      current = ''
    }
  }

  if (current.trim()) {
    paragraphs.push(current.trim())
  }

  return paragraphs.length > 0 ? paragraphs : [text]
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content) return null

  const preprocessed = preprocessContent(content)
  const sanitized = DOMPurify.sanitize(preprocessed, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  })

  return (
    <div
      className={`prose prose-invert max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

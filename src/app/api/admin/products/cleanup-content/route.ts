// src/app/api/admin/products/cleanup-content/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * POST /api/admin/products/cleanup-content
 *
 * One-time utility to clean up product content in the database:
 * - Strip emojis from overview/advantages/capabilities/applications
 * - Decode HTML entities to proper characters
 * - Remove redundant inline headings ("Product Overview", "Core Advantages", etc.)
 * - Convert plain text content into proper HTML structure
 * - Remove emoji-prefixed bullet point lines that duplicate spec info
 */

// Emoji regex pattern
const EMOJI_PATTERN = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2B55}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{200D}]|[\u{20E3}]|[\u{E0020}-\u{E007F}]/gu

// HTML entities to decode
const HTML_ENTITIES: Record<string, string> = {
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
  '&para;': '',
  '&sect;': '§',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
}

// Redundant heading patterns to remove from content start
const REDUNDANT_HEADINGS = [
  /^Product Overview\s*/i,
  /^Core Advantages\s*/i,
  /^Core Security Capabilities\s*/i,
  /^Core Capabilities\s*/i,
  /^Authorized Application Scenarios\s*/i,
  /^Application Scenarios\s*/i,
  /^Core Security Advantages\s*/i,
]

// Emoji-prefixed bullet line patterns (e.g., "⏱️ Long Endurance 5h...")
const EMOJI_BULLET_PATTERN = /^[⏱📸💪🔙🛠⚡🪶🔥🎯🚁📡🛡✅🔧🌟💡🚀🛡️]+\s+.+$/gm

function decodeHtmlEntities(text: string): string {
  let result = text
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    result = result.replaceAll(entity, char)
  }
  // Also decode numeric entities
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
  return result
}

function stripEmojis(text: string): string {
  return text.replace(EMOJI_PATTERN, '').replace(/[\u{FE0F}]/gu, '')
}

function removeRedundantHeadings(text: string): string {
  let result = text
  for (const pattern of REDUNDANT_HEADINGS) {
    result = result.replace(pattern, '')
  }
  return result.trim()
}

function removeEmojiBulletLines(text: string): string {
  return text.replace(EMOJI_BULLET_PATTERN, '').trim()
}

function cleanTextContent(text: string): string {
  if (!text) return text

  let result = text

  // If content is already HTML (contains tags), clean it differently
  if (/<[a-z][\s\S]*>/i.test(result)) {
    // Strip emojis from HTML content
    result = stripEmojis(result)
    // Decode HTML entities within text nodes (but not in tags)
    result = decodeHtmlEntities(result)
    // Remove emoji bullet lines
    result = removeEmojiBulletLines(result)
    // Clean up multiple whitespace/newlines
    result = result.replace(/\n{3,}/g, '\n\n')
    return result.trim()
  }

  // Plain text content
  // 1. Decode HTML entities
  result = decodeHtmlEntities(result)
  // 2. Remove redundant headings
  result = removeRedundantHeadings(result)
  // 3. Strip emojis
  result = stripEmojis(result)
  // 4. Remove emoji-prefixed bullet lines
  result = removeEmojiBulletLines(result)
  // 5. Clean up whitespace
  result = result.replace(/\s+/g, ' ').trim()

  // 6. Convert to proper HTML structure if it's substantial content
  if (result.length > 100) {
    result = textToHtml(result)
  }

  return result
}

function textToHtml(text: string): string {
  // Split into paragraphs on sentence boundaries or double newlines
  const paragraphs = text
    .split(/\n\n+|\.\s+(?=[A-Z])/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  if (paragraphs.length <= 1) {
    return `<p>${text}</p>`
  }

  return paragraphs.map(p => `<p>${p}</p>`).join('\n')
}

function cleanTranslations(translations: Record<string, Record<string, string>>): {
  cleaned: Record<string, Record<string, string>>
  changes: string[]
} {
  const changes: string[] = []
  const cleaned: Record<string, Record<string, string>> = {}

  for (const [locale, fields] of Object.entries(translations)) {
    cleaned[locale] = {}
    for (const [field, value] of Object.entries(fields)) {
      if (['overview', 'advantages', 'capabilities', 'applications'].includes(field)) {
        const cleanedValue = cleanTextContent(value)
        if (cleanedValue !== value) {
          changes.push(`${locale}.${field}: content cleaned`)
        }
        cleaned[locale][field] = cleanedValue
      } else {
        cleaned[locale][field] = value
      }
    }
  }

  return { cleaned, changes }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dryRun = true, productSlug } = body

    // Fetch products
    let query = supabaseAdmin
      .from('products')
      .select('id, model, slug, translations')

    if (productSlug) {
      query = query.eq('slug', productSlug)
    }

    const { data: products, error: fetchError } = await query

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 })
    }

    const results: Array<{
      slug: string
      model: string
      changes: string[]
      updated: boolean
    }> = []

    for (const product of products) {
      const { cleaned, changes } = cleanTranslations(product.translations || {})

      if (changes.length === 0) {
        results.push({
          slug: product.slug,
          model: product.model,
          changes: [],
          updated: false,
        })
        continue
      }

      if (!dryRun) {
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ translations: cleaned })
          .eq('id', product.id)

        if (updateError) {
          changes.push(`UPDATE ERROR: ${updateError.message}`)
        }
      }

      results.push({
        slug: product.slug,
        model: product.model,
        changes,
        updated: !dryRun,
      })
    }

    return NextResponse.json({
      mode: dryRun ? 'dry-run' : 'live',
      totalProducts: products.length,
      productsWithChanges: results.filter(r => r.changes.length > 0).length,
      results,
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

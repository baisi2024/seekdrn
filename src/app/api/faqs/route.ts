import { NextResponse } from 'next/server'
import { getFAQs } from '@/lib/faqs/api'

export async function GET() {
  const faqs = await getFAQs()
  return NextResponse.json(faqs)
}
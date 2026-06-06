import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductSEO, SEOFormData } from '../types'

export async function getSEO(productId: string, locale: string) {
  const { data, error } = await supabaseAdmin
    .from('product_seo')
    .select('*')
    .eq('product_id', productId)
    .eq('locale', locale)
    .maybeSingle()

  if (error) throw error
  return data as ProductSEO | null
}

export async function getAllSEO(productId: string) {
  const { data, error } = await supabaseAdmin
    .from('product_seo')
    .select('*')
    .eq('product_id', productId)

  if (error) throw error
  return data as ProductSEO[]
}

export async function upsertSEO(productId: string, locale: string, seo: SEOFormData) {
  const { data, error } = await supabaseAdmin
    .from('product_seo')
    .upsert({
      product_id: productId,
      locale,
      ...seo,
    })
    .select()
    .single()

  if (error) throw error
  return data as ProductSEO
}

export async function deleteSEO(productId: string, locale: string) {
  const { error } = await supabaseAdmin
    .from('product_seo')
    .delete()
    .eq('product_id', productId)
    .eq('locale', locale)

  if (error) throw error
}

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductTag, TagFormData } from '../types'

export async function getTags(includeProductCount = false) {
  const { data, error } = await supabaseAdmin
    .from('product_tags')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  if (includeProductCount) {
    // Get product count for each tag
    const tagsWithCount = await Promise.all(
      (data as ProductTag[]).map(async (tag) => {
        const { count } = await supabaseAdmin
          .from('products')
          .select('*', { count: 'exact', head: true })
          .contains('tags', [tag.slug])
        
        return { ...tag, product_count: count || 0 }
      })
    )
    return tagsWithCount
  }

  return data as ProductTag[]
}

export async function getTag(id: string) {
  const { data, error } = await supabaseAdmin
    .from('product_tags')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ProductTag
}

export async function getTagBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('product_tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as ProductTag
}

export async function createTag(tag: TagFormData) {
  const { data, error } = await supabaseAdmin
    .from('product_tags')
    .insert([tag])
    .select()
    .single()

  if (error) throw error
  return data as ProductTag
}

export async function updateTag(id: string, tag: Partial<TagFormData>) {
  const { data, error } = await supabaseAdmin
    .from('product_tags')
    .update(tag)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ProductTag
}

export async function deleteTag(id: string) {
  // First get the tag to get its slug
  const { data: tag } = await supabaseAdmin
    .from('product_tags')
    .select('slug')
    .eq('id', id)
    .single()

  if (tag) {
    // Remove tag from all products that have it
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, tags')
      .contains('tags', [tag.slug])

    if (products) {
      await Promise.all(
        products.map(product => {
          const updatedTags = product.tags.filter((t: string) => t !== tag.slug)
          return supabaseAdmin
            .from('products')
            .update({ tags: updatedTags })
            .eq('id', product.id)
        })
      )
    }
  }

  // Delete the tag
  const { error } = await supabaseAdmin
    .from('product_tags')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function addTagToProduct(productId: string, tagSlug: string) {
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('tags')
    .eq('id', productId)
    .single()

  if (productError) throw productError

  if (!product.tags.includes(tagSlug)) {
    const { error } = await supabaseAdmin
      .from('products')
      .update({ tags: [...product.tags, tagSlug] })
      .eq('id', productId)

    if (error) throw error
  }
}

export async function removeTagFromProduct(productId: string, tagSlug: string) {
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('tags')
    .eq('id', productId)
    .single()

  if (productError) throw productError

  const updatedTags = product.tags.filter((t: string) => t !== tagSlug)
  const { error } = await supabaseAdmin
    .from('products')
    .update({ tags: updatedTags })
    .eq('id', productId)

  if (error) throw error
}

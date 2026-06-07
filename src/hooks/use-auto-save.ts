'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { debounce } from '@/lib/performance-utils'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void> | void
  delay?: number
  enabled?: boolean
}

/**
 * 自动保存 Hook
 * @param options 配置选项
 * @returns 自动保存状态
 */
export function useAutoSave<T>(options: UseAutoSaveOptions<T>) {
  const { data, onSave, delay = 2000, enabled = true } = options
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const previousDataRef = useRef<T>(data)
  const debouncedSaveRef = useRef<((data: T) => void) | null>(null)

  // 创建防抖保存函数
  const createDebouncedSave = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saveFn = async (dataToSave: T) => {
      try {
        setIsSaving(true)
        await onSave(dataToSave)
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error('Auto save failed:', error)
      } finally {
        setIsSaving(false)
      }
    }
    return debounce(saveFn as (...args: unknown[]) => unknown, delay) as (data: T) => void
  }, [onSave, delay])

  // 初始化防抖函数
  useEffect(() => {
    debouncedSaveRef.current = createDebouncedSave()
  }, [createDebouncedSave])

  useEffect(() => {
    if (!enabled || !debouncedSaveRef.current) return

    // 检查数据是否变化
    const hasChanged =
      JSON.stringify(data) !== JSON.stringify(previousDataRef.current)

    if (hasChanged) {
      setHasUnsavedChanges(true)
      previousDataRef.current = data
      debouncedSaveRef.current(data)
    }
  }, [data, enabled])

  const saveImmediately = async () => {
    try {
      setIsSaving(true)
      await onSave(data)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      previousDataRef.current = data
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveImmediately,
  }
}

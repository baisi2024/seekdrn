'use client'

import { memo } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * 邮件模板卡片骨架屏
 */
export const TemplateCardSkeleton = memo(function TemplateCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* 渐变边框效果 */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </CardHeader>
      
      <CardContent className="pb-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t pt-3">
        <Skeleton className="h-3 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardFooter>
    </Card>
  )
})

/**
 * 邮件日志卡片骨架屏
 */
export const LogCardSkeleton = memo(function LogCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
      
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-5 rounded-full shrink-0" />
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          <Skeleton className="h-9 w-20 rounded shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
})

/**
 * 统计卡片骨架屏
 */
export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
})

/**
 * 表单骨架屏
 */
export const FormSkeleton = memo(function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* 基本信息卡片 */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
      
      {/* 变量配置卡片 */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </CardContent>
      </Card>
      
      {/* 邮件内容卡片 */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      
      {/* 操作按钮 */}
      <div className="flex gap-4 justify-end">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
})

'use client'

import type { ReactNode } from 'react'
import { Skeleton as BoneyardSkeleton } from 'boneyard-js/react'

type BoneyardSkeletonBoundaryProps = {
  name: string
  loading: boolean
  loadingContent?: ReactNode
  children: ReactNode
  className?: string
  fixture?: ReactNode
  animate?: boolean
}

export function BoneyardSkeletonBoundary({
  name,
  loading,
  loadingContent,
  children,
  className,
  fixture,
  animate = true,
}: BoneyardSkeletonBoundaryProps) {
  return (
    <BoneyardSkeleton
      name={name}
      loading={loading}
      fallback={loadingContent}
      fixture={fixture}
      className={className}
      animate={animate}
    >
      {children}
    </BoneyardSkeleton>
  )
}
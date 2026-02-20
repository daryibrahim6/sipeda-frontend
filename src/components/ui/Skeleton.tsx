// src/components/ui/Skeleton.tsx

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

// ─── Page-level Skeletons ─────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-7 w-16 mb-1.5" />
        <Skeleton className="h-4 w-28 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ScheduleCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-1.5" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Skeleton className="h-3 w-14 mb-1" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div>
          <Skeleton className="h-3 w-14 mb-1" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Skeleton className="w-full aspect-video rounded-none" />
      <div className="p-5">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function LocationCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-24 mb-3" />
      <div className="flex gap-1.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-5 w-12 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

export function BloodStockSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <div className="min-w-[640px]">
        <div className="bg-gray-50 border-b border-gray-200 flex gap-4 px-4 py-3">
          <Skeleton className="h-5 w-36" />
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-10 mx-auto flex-1" />
          ))}
          <Skeleton className="h-5 w-12" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100">
            <div className="w-36">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-10" />
            </div>
            {[...Array(8)].map((_, j) => (
              <div key={j} className="flex-1 flex flex-col items-center gap-1">
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
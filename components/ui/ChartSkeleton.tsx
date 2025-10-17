'use client';

import React from 'react';

interface ChartSkeletonProps {
  height?: number;
  title?: string;
}

export default function ChartSkeleton({ height = 350, title = "Cargando gráfico..." }: ChartSkeletonProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div 
        className="animate-pulse bg-gray-200 rounded-lg flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-300 rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

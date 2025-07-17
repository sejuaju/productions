import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = false
}) => {
  return (
    <div
      className={`
        ${width} ${height} 
        bg-gradient-to-r from-[var(--hover)] via-[var(--card-border)] to-[var(--hover)]
        animate-pulse
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
    />
  );
};

export const PoolListSkeleton: React.FC = () => {
  return (
    <div className="card p-6 shadow-md dark:shadow-lg">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <SkeletonLoader width="w-32" height="h-6" />
        <div className="flex gap-2">
          <SkeletonLoader width="w-20" height="h-8" />
          <SkeletonLoader width="w-20" height="h-8" />
          <SkeletonLoader width="w-8" height="h-8" rounded />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto rounded-lg min-h-[400px]">
        <table className="min-w-full">
          <thead className="bg-[var(--hover)] dark:bg-[var(--bg-primary)]">
            <tr>
              <th className="py-3 px-4 text-left">
                <SkeletonLoader width="w-12" height="h-4" />
              </th>
              <th className="py-3 px-4 text-right">
                <SkeletonLoader width="w-8" height="h-4" />
              </th>
              <th className="py-3 px-4 text-right">
                <SkeletonLoader width="w-8" height="h-4" />
              </th>
              <th className="py-3 px-4 text-right">
                <SkeletonLoader width="w-16" height="h-4" />
              </th>
              <th className="py-3 px-4 text-right">
                <SkeletonLoader width="w-12" height="h-4" />
              </th>
            </tr>
          </thead>
          <tbody style={{ minHeight: '320px' }}>
            {[...Array(3)].map((_, index) => (
              <tr key={index} className="border-b border-[var(--card-border)]">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="relative w-10 h-10 flex items-center justify-center mr-2">
                      <SkeletonLoader width="w-6" height="h-6" rounded />
                      <SkeletonLoader width="w-6" height="h-6" rounded className="absolute right-0" />
                    </div>
                    <div>
                      <SkeletonLoader width="w-16" height="h-4" className="mb-1" />
                      <SkeletonLoader width="w-20" height="h-3" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <SkeletonLoader width="w-16" height="h-4" />
                </td>
                <td className="py-4 px-4 text-right">
                  <SkeletonLoader width="w-12" height="h-4" />
                </td>
                <td className="py-4 px-4 text-right">
                  <SkeletonLoader width="w-16" height="h-4" />
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <SkeletonLoader width="w-12" height="h-6" />
                    <SkeletonLoader width="w-16" height="h-6" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl p-6 shadow-md">
      <SkeletonLoader width="w-32" height="h-4" className="mb-2" />
      <div className="flex items-baseline">
        <SkeletonLoader width="w-24" height="h-8" className="mb-2" />
      </div>
      <SkeletonLoader width="w-20" height="h-4" />
    </div>
  );
};

export default SkeletonLoader; 
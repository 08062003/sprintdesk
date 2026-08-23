export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function BoardColumnSkeleton() {
  return (
    <div className="bg-gray-100 rounded-lg p-4 space-y-3">
      <Skeleton className="h-6 w-1/3 mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-4 rounded-md shadow-sm space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <Skeleton className="h-6 w-1/4 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Skeleton className="h-6 w-1/4 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

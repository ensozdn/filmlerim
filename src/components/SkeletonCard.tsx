export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-200 dark:border-white/5 animate-pulse">
      {/* Poster skeleton */}
      <div className="relative aspect-[2/3] bg-gray-300 dark:bg-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-t dark:from-gray-900 dark:via-transparent to-transparent"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-3 md:p-5 space-y-3">
        {/* Title */}
        <div className="h-5 md:h-6 bg-gray-300 dark:bg-gray-700/50 rounded w-3/4"></div>
        
        {/* Rating and year */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded w-12"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded w-16"></div>
        </div>
        
        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-700/50 rounded w-full"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700/50 rounded w-5/6"></div>
        </div>
        
        {/* Genres */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-700/50 rounded-full w-16"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700/50 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
}

const PostCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
      {/* Image Placeholder */}
      <div className="relative overflow-hidden">
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
      </div>

      {/* Content Placeholder */}
      <div className="p-6">
        {/* Title Placeholder */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        {/* Content Lines Placeholder */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-11/12 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>

        {/* Author Info Placeholder */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>

        {/* Buttons Placeholder */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;
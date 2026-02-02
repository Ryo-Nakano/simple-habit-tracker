import React from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-green-600 mb-4"></div>
        <p className="text-gray-700 dark:text-gray-200 font-medium">処理中...</p>
      </div>
    </div>
  );
};

import React from "react";

interface CalendarCellProps {
  date: Date;
  isAchieved: boolean;
  isToday: boolean;
  isCurrentMonth?: boolean; // MonthlyViewで当月以外を薄くするため
  onClick: () => void;
}

export const CalendarCell: React.FC<CalendarCellProps> = ({
  date,
  isAchieved,
  isToday,
  isCurrentMonth = true,
  onClick,
}) => {
  const day = date.getDate();

  // ベーススタイル
  const baseClasses =
    "relative flex flex-col items-center justify-center transition-all cursor-pointer rounded-md";

  // 正方形固定
  const sizeClasses = "aspect-square w-full";

  // 達成状態のスタイル
  let statusClasses = "";
  if (isAchieved) {
    statusClasses = "bg-green-500 hover:bg-green-600 shadow-sm"; // 塗りつぶし
  } else {
    statusClasses = "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"; // 薄いグレー背景
  }

  // 今日の強調 (リングだけつける)
  const todayClasses = isToday
    ? "ring-2 ring-gray-400 dark:ring-gray-500 ring-offset-2 dark:ring-offset-gray-900 z-10"
    : "";

  // 日付文字の色
  const dateTextClass = isAchieved
    ? "text-white font-bold"
    : "text-gray-400 dark:text-gray-600";

  // 当月以外のスタイル（MonthlyView用）
  const opacityClasses = !isCurrentMonth ? "opacity-20" : "";

  return (
    <div
      className={`${baseClasses} ${sizeClasses} ${statusClasses} ${todayClasses} ${opacityClasses}`}
      onClick={onClick}
    >
      {/* 日付は極小で中央配置 */}
      <span className={`text-[10px] ${dateTextClass}`}>
        {day}
      </span>
    </div>
  );
};

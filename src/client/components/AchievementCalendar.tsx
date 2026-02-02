import { useState, useMemo } from "react";
import { MonthlyView } from "./CalendarViews/MonthlyView";
import { QuarterlyView } from "./CalendarViews/QuarterlyView";
import type { Task, Log } from "../types";

interface AchievementCalendarProps {
  tasks: Task[];
  logs: Log[];
  onDateClick: (date: string) => void;
}

type ViewMode = 'monthly' | 'quarterly';

export function AchievementCalendar({
  tasks,
  logs,
  onDateClick,
}: AchievementCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  // 全タスク達成日（草が生える日）を計算
  const achievedDates = useMemo(() => {
    if (tasks.length === 0) return new Set<string>();

    const logCountByDate = new Map<string, Set<string>>();

    logs.forEach((log) => {
      // 現在のタスクリストに存在するタスクのみカウント
      const taskExists = tasks.some((t) => t.id === log.taskId);
      if (!taskExists) return;

      if (!logCountByDate.has(log.date)) {
        logCountByDate.set(log.date, new Set());
      }
      logCountByDate.get(log.date)!.add(log.taskId);
    });

    const dates = new Set<string>();
    logCountByDate.forEach((taskIds, date) => {
      if (taskIds.size === tasks.length) {
        dates.add(date);
      }
    });

    return dates;
  }, [tasks, logs]);

  // ナビゲーション操作
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // タイトル表示
  const getTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (viewMode === 'monthly') {
      return `${year}年 ${month}月`;
    } else {
      // Quarterly (Half-yearly now): "2026年 2月 - 7月"
      // 終了月を計算 (+5ヶ月で計6ヶ月)
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 5);
      const endMonth = endDate.getMonth() + 1;

      if (year !== endDate.getFullYear()) {
        return `${year}年${month}月 - ${endDate.getFullYear()}年${endMonth}月`;
      }
      return `${year}年 ${month}月 - ${endMonth}月`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      {/* ヘッダー・ナビゲーション */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 sm:gap-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          達成カレンダー
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'monthly'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('quarterly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'quarterly'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              Quarterly
            </button>
          </div>

          <div className="border-l border-gray-200 dark:border-gray-600 h-6 mx-2 hidden sm:block"></div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              ←
            </button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {getTitle()}
            </span>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* カレンダー表示エリア */}
      {viewMode === 'monthly' ? (
        <MonthlyView
          currentDate={currentDate}
          achievedDates={achievedDates}
          onDateClick={onDateClick}
        />
      ) : (
        <QuarterlyView
          currentDate={currentDate}
          achievedDates={achievedDates}
          onDateClick={onDateClick}
        />
      )}

      {/* 凡例 */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>未達成</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
        </div>
        <span>達成</span>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { MonthlyView } from "./CalendarViews/MonthlyView";
import type { Task, Log } from "../types";

interface AchievementCalendarProps {
  tasks: Task[];
  logs: Log[];
  onDateClick: (date: string) => void;
}

export function AchievementCalendar({
  tasks,
  logs,
  onDateClick,
}: AchievementCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
    return `${year}年 ${month}月`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      {/* ヘッダー・ナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          達成カレンダー
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              ←
            </button>
            <span className="text-sm font-medium w-24 text-center">
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
      <MonthlyView
        currentDate={currentDate}
        achievedDates={achievedDates}
        onDateClick={onDateClick}
      />

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

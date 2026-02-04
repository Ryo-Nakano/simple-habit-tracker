import React from "react";
import { formatDateToString } from "../../utils/date";

interface QuarterlyViewProps {
  currentDate: Date;
  achievedDates: Set<string>;
  onDateClick: (date: string) => void;
}

export const QuarterlyView: React.FC<QuarterlyViewProps> = ({
  currentDate,
  achievedDates,
  // onDateClick, // 閲覧専用のため未使用
}) => {
  // 表示期間の計算:
  // 開始日: 開始月(currentDateの月)の1日が含まれる週の日曜日
  // 終了日: 終了月(currentDate + 5ヶ月 = 半年)の末日が含まれる週の土曜日

  const startMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, 0);

  const startDate = new Date(startMonthDate);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // 前の日曜日へ

  const endDate = new Date(endMonthDate);
  // 安全のため、週の終わりまで埋める
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  // 日付リスト生成
  const dates: Date[] = [];
  const current = new Date(startDate);
  // 安全装置
  let count = 0;
  while (current <= endDate && count < 370) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
    count++;
  }

  // 今日の日付を取得（比較用）
  const today = new Date();
  const isDateToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  // 月ラベルの位置計算
  const weeksCount = Math.ceil(dates.length / 7);
  const monthLabels: { label: string; colIndex: number }[] = [];

  let currentMonthStr = "";
  for (let i = 0; i < weeksCount; i++) {
    const sundayDate = dates[i * 7];
    if (!sundayDate) break;

    // 月を取得 (英語表記短縮形)
    const monthStr = sundayDate.toLocaleString('en-US', { month: 'short' });

    if (monthStr !== currentMonthStr) {
      monthLabels.push({ label: monthStr, colIndex: i });
      currentMonthStr = monthStr;
    }
  }

  // サイズ定義
  // Dot: w-3 h-3 (12px)
  // Gap: gap-1 (4px)
  // Col Width: 12 + 4 = 16px
  const colWidth = 16;

  return (
    <div className="flex flex-col overflow-x-auto">
      {/* 全体を枠で囲む */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-[#0d1117] inline-block min-w-max">

        <div className="flex">
          {/* 曜日ラベル (左側) */}
          {/* 月ラベルの高さ分(例えば16px) + gap分 を下げる必要がある */}
          <div className="flex flex-col gap-1 mr-2 pt-[16px]">
            <div className="h-3 text-[10px] text-transparent">Sun</div>
            <div className="h-3 text-[10px] leading-[12px] text-gray-400">Mon</div>
            <div className="h-3 text-[10px] text-transparent">Tue</div>
            <div className="h-3 text-[10px] leading-[12px] text-gray-400">Wed</div>
            <div className="h-3 text-[10px] text-transparent">Thu</div>
            <div className="h-3 text-[10px] leading-[12px] text-gray-400">Fri</div>
            <div className="h-3 text-[10px] text-transparent">Sat</div>
          </div>

          {/* ヒートマップ本体コンテナ */}
          <div className="flex flex-col">
            {/* 月ラベル行 */}
            <div className="relative h-[16px] mb-1 w-full">
              {monthLabels.map((item, idx) => (
                <div
                  key={idx}
                  className="absolute text-[10px] text-gray-500 dark:text-gray-400"
                  style={{ left: `${item.colIndex * colWidth}px` }}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* グリッド (Cell: 12px, Gap: 4px) */}
            <div
              className="grid gap-1 grid-rows-7 grid-flow-col"
            >
              {dates.map((date, idx) => {
                const dateStr = formatDateToString(date);
                const isAchieved = achievedDates.has(dateStr);
                const isToday = isDateToday(date);

                let bgClass = "bg-[#ebedf0] dark:bg-[#161b22]";
                if (isAchieved) {
                  bgClass = "bg-[#39d353]";
                }

                return (
                  <div
                    key={idx}
                    title={dateStr}
                    className={`w-3 h-3 rounded-[2px] ${bgClass} ${isToday ? 'ring-1 ring-gray-400' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

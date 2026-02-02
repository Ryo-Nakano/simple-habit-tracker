import React from "react";
import { CalendarCell } from "./CalendarCell";

interface MonthlyViewProps {
  currentDate: Date;
  achievedDates: Set<string>;
  onDateClick: (date: string) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  achievedDates,
  onDateClick,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月の最初の日と最後の日を取得
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  // カレンダーの開始日（週の始まり＝日曜日まで遡る）
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // カレンダーの終了日（週の終わり＝土曜日まで進める）
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  // 日付リストを生成
  const days: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // 今日の日付を取得（比較用）
  const today = new Date();
  const isDateToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  // YYYY-MM-DD 文字列変換
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  return (
    <div>
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-2 text-center text-xs text-gray-400">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((date, index) => {
          const dateStr = formatDate(date);
          const isCurrentMonth = date.getMonth() === month;

          return (
            <CalendarCell
              key={index}
              date={date}
              isAchieved={achievedDates.has(dateStr)}
              isToday={isDateToday(date)}
              isCurrentMonth={isCurrentMonth}
              onClick={() => onDateClick(dateStr)}
            />
          );
        })}
      </div>
    </div>
  );
};

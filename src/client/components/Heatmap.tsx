import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import type { Task, Log } from "../types";

interface HeatmapProps {
  tasks: Task[];
  logs: Log[];
  onDateClick: (date: string) => void;
}

interface HeatmapValue {
  date: string;
  count: number;
}

/**
 * ヒートマップコンポーネント - 過去の達成状況を草として可視化
 */
export function Heatmap({ tasks, logs, onDateClick }: HeatmapProps) {
  // 過去1年分の日付範囲を計算
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // 各日付の達成状況を計算
  const taskCount = tasks.length;

  const getDateValues = (): HeatmapValue[] => {
    if (taskCount === 0) return [];

    // 日付ごとのログ数をカウント
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

    // 達成日のみをヒートマップ用データに変換
    const values: HeatmapValue[] = [];
    logCountByDate.forEach((taskIds, date) => {
      // 全タスク達成の場合のみ count = 1（草が生える）
      if (taskIds.size === taskCount) {
        values.push({ date, count: 1 });
      }
    });

    return values;
  };

  const values = getDateValues();

  // 日付クリックハンドラ
  const handleClick = (value: HeatmapValue | null) => {
    if (value?.date) {
      onDateClick(value.date);
    }
  };

  // 色のクラス名を返す
  const classForValue = (value: HeatmapValue | null) => {
    if (!value || value.count === 0) {
      return "color-empty";
    }
    return "color-scale-4"; // 全達成は最も濃い色
  };

  // ツールチップ用のタイトル
  const titleForValue = (value: HeatmapValue | null) => {
    if (!value?.date) return "";
    const d = new Date(value.date);
    const dateStr = d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return value.count > 0 ? `${dateStr}: 全タスク達成！🌱` : dateStr;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        達成カレンダー
      </h2>

      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={oneYearAgo}
          endDate={today}
          values={values}
          classForValue={classForValue}
          titleForValue={titleForValue}
          onClick={handleClick}
          showWeekdayLabels
          gutterSize={2}
        />
      </div>

      {/* 凡例 */}
      <div className="flex items-center justify-end gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
        <span>未達成</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#216e39" }} />
        </div>
        <span>達成</span>
      </div>
    </div>
  );
}

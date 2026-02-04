import { TaskList } from "./TaskList";
import { AchievementCalendar } from "./AchievementCalendar";
import type { Task, Log } from "../types";

interface DashboardProps {
  tasks: Task[];
  logs: Log[];
  selectedDate: string;
  onToggleLog: (taskId: string, isDone: boolean) => void;
  onEditTask: (task: Task) => void;
  onAddTask: (title: string) => Promise<void>;
  onDateClick: (date: string) => void;
}

/**
 * ダッシュボード - メイン画面レイアウト
 */
export function Dashboard({
  tasks,
  logs,
  selectedDate,
  onToggleLog,
  onEditTask,
  onAddTask,
  onDateClick,
}: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🌱</span>
            <span>habitra</span>
          </h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 達成カレンダー */}
        <AchievementCalendar tasks={tasks} logs={logs} onDateClick={onDateClick} />

        {/* タスクリスト */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <TaskList
            tasks={tasks}
            logs={logs}
            selectedDate={selectedDate}
            onToggleLog={onToggleLog}
            onEditTask={onEditTask}
            onAddTask={onAddTask}
          />
        </div>
      </main>

      {/* フッター */}
      <footer className="text-center py-4 text-sm text-gray-400 dark:text-gray-500">
        habitra &copy; 2026
      </footer>
    </div>
  );
}

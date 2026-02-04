import { TaskItem } from "./TaskItem";
import { AddTaskForm } from "./AddTaskForm";
import type { Task, Log } from "../types";

interface TaskListProps {
  tasks: Task[];
  logs: Log[];
  selectedDate: string;
  onToggleLog: (taskId: string, isDone: boolean) => void;
  onEditTask: (task: Task) => void;
  onAddTask: (title: string) => Promise<void>;
}

/**
 * タスクリストコンポーネント
 */
export function TaskList({
  tasks,
  logs,
  selectedDate,
  onToggleLog,
  onEditTask,
  onAddTask,
}: TaskListProps) {
  // 選択された日付のログからタスクID一覧を取得
  const completedTaskIds = new Set(
    logs.filter((log) => log.date === selectedDate).map((log) => log.taskId)
  );

  // 達成率を計算
  const completedCount = tasks.filter((t) => completedTaskIds.has(t.id)).length;
  const totalCount = tasks.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  // 日付をフォーマット
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    if (target.getTime() === today.getTime()) {
      return "今日";
    }

    return d.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatDate(selectedDate)}のタスク
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${allCompleted
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
        >
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* プログレスバー */}
      {/* プログレスバー */}
      {totalCount > 0 && (
        <div className="w-full mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">
            {Math.round((completedCount / totalCount) * 100)}% 完了
          </div>
        </div>
      )}
      {totalCount === 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 opacity-50"></div>
      )}

      {/* タスク追加フォーム */}
      <AddTaskForm onAdd={onAddTask} />

      {/* タスクリスト */}
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isCompleted={completedTaskIds.has(task.id)}
            onToggle={onToggleLog}
            onEdit={onEditTask}
          />
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          タスクがありません。上のフォームから追加してください。
        </p>
      )}

      {/* 全タスク達成時のメッセージ */}
      {allCompleted && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <span className="text-2xl">🌱</span>
          <p className="mt-2 text-green-800 dark:text-green-300 font-medium">
            全タスク達成！今日も草が生えました！
          </p>
        </div>
      )}
    </div>
  );
}

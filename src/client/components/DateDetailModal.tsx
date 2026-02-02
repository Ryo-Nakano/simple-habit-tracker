import { Modal } from "./Modal";
import type { Task, Log } from "../types";

interface DateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  tasks: Task[];
  logs: Log[];
  onToggleLog: (date: string, taskId: string, isDone: boolean) => Promise<void>;
}

/**
 * 日付詳細モーダル - 選択した日付のタスク達成状況を表示・編集
 */
export function DateDetailModal({
  isOpen,
  onClose,
  date,
  tasks,
  logs,
  onToggleLog,
}: DateDetailModalProps) {
  if (!date) return null;

  // 選択した日付のログを取得
  const dateLogs = logs.filter((log) => log.date === date);
  const completedTaskIds = new Set(dateLogs.map((log) => log.taskId));

  // 達成率を計算
  const completedCount = tasks.filter((t) => completedTaskIds.has(t.id)).length;
  const totalCount = tasks.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  const handleToggle = async (taskId: string) => {
    const isDone = !completedTaskIds.has(taskId);
    await onToggleLog(date, taskId, isDone);
  };

  // 日付をフォーマット
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formatDate(date)}>
      <div className="space-y-4">
        {/* 達成状況サマリー */}
        <div
          className={`p-3 rounded-lg text-center ${allCompleted
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
        >
          {allCompleted ? (
            <span className="font-medium">🌱 全タスク達成！</span>
          ) : (
            <span>
              {completedCount} / {totalCount} タスク達成
            </span>
          )}
        </div>

        {/* タスクリスト */}
        <ul className="space-y-2">
          {tasks.map((task) => {
            const isCompleted = completedTaskIds.has(task.id);
            return (
              <li key={task.id}>
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => handleToggle(task.id)}
                    className="w-6 h-6 rounded border-gray-300 dark:border-gray-600 
                               text-green-600 focus:ring-green-500"
                  />
                  <span
                    className={`flex-1 ${isCompleted
                      ? "text-gray-500 dark:text-gray-400 line-through"
                      : "text-gray-900 dark:text-white"
                      }`}
                  >
                    {task.title}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        {tasks.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            タスクがありません
          </p>
        )}
      </div>
    </Modal>
  );
}

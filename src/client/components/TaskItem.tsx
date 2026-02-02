import type { Task } from "../types";

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onToggle: (taskId: string, isDone: boolean) => void;
  onEdit: (task: Task) => void;
}

/**
 * 個別タスク行コンポーネント
 */
export function TaskItem({
  task,
  isCompleted,
  onToggle,
  onEdit,
}: TaskItemProps) {
  const handleCheckboxChange = () => {
    onToggle(task.id, !isCompleted);
  };

  return (
    <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* チェックボックス */}
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleCheckboxChange}
        className="w-6 h-6 rounded border-gray-300 dark:border-gray-600 
                   text-green-600 focus:ring-green-500 cursor-pointer"
      />

      {/* タスク名 */}
      <span
        className={`flex-1 ${isCompleted
          ? "text-gray-400 dark:text-gray-500 line-through"
          : "text-gray-900 dark:text-white"
          }`}
      >
        {task.title}
      </span>

      {/* 編集ボタン */}
      <button
        onClick={() => onEdit(task)}
        className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                   hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="編集"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </button>
    </li>
  );
}

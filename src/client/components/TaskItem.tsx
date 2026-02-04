import type { Task } from "../types";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onToggle: (taskId: string, isDone: boolean) => void;
  onEdit: (task: Task) => void;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
  style?: React.CSSProperties;
}

/**
 * 個別タスク行コンポーネント
 */
export function TaskItem({
  task,
  isCompleted,
  onToggle,
  onEdit,
  dragHandleListeners,
  dragHandleAttributes,
  style,
}: TaskItemProps) {
  const handleCheckboxChange = () => {
    onToggle(task.id, !isCompleted);
  };

  return (
    <li
      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow touch-manipulation"
      style={style}
    >
      {/* ドラッグハンドル */}
      <button
        {...dragHandleListeners}
        {...dragHandleAttributes}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
        aria-label="ドラッグして並び替え"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
      </button>

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


import { useState } from "react";

interface AddTaskFormProps {
  onAdd: (title: string) => Promise<void>;
}

/**
 * 新規タスク追加フォーム
 */
export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isAdding) return;

    setIsAdding(true);
    try {
      await onAdd(title.trim());
      setTitle("");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいタスクを追加..."
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   placeholder-gray-400 dark:placeholder-gray-500
                   focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={!title.trim() || isAdding}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium
                   rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAdding ? "追加中..." : "追加"}
      </button>
    </form>
  );
}

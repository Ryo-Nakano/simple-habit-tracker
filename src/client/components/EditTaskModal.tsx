import { useState } from "react";
import { Modal } from "./Modal";
import type { Task } from "../types";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (taskId: string, newTitle: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

/**
 * タスク編集モーダル
 */
export function EditTaskModal({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // タスクが変わったらタイトルを更新
  if (task && title !== task.title && !isSaving) {
    setTitle(task.title);
  }

  const handleSave = async () => {
    if (!task || !title.trim()) return;

    setIsSaving(true);
    try {
      await onSave(task.id, title.trim());
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    if (!confirm("このタスクを削除しますか？")) return;

    setIsDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="タスクを編集">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            タスク名
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="タスク名を入力"
          />
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 
                       rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? "削除中..." : "削除"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                         dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white 
                         rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

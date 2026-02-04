import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { EditTaskModal } from "./components/EditTaskModal";
import { DateDetailModal } from "./components/DateDetailModal";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { server } from "./utils/gas";
import { getTodayString } from "./utils/date";
import type { Task, Log } from "./types";

/**
 * アプリケーションのメインコンポーネント
 */
function App() {
  // ステート
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate] = useState(getTodayString());

  // モーダル関連のステート
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dateDetailDate, setDateDetailDate] = useState<string | null>(null);

  // 初期データの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await server.getInitialData();
        setTasks(data.tasks);
        setLogs(data.logs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得に失敗しました");
        console.error("Failed to fetch initial data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ログのトグル（今日のタスクリスト用）
  const handleToggleLog = async (taskId: string, isDone: boolean) => {
    setIsProcessing(true);
    // 楽観的更新
    if (isDone) {
      setLogs((prev) => [...prev, { date: selectedDate, taskId }]);
    } else {
      setLogs((prev) =>
        prev.filter((log) => !(log.date === selectedDate && log.taskId === taskId))
      );
    }

    try {
      await server.toggleLog(selectedDate, taskId, isDone);
    } catch (err) {
      // エラー時はロールバック
      console.error("Failed to toggle log:", err);
      if (isDone) {
        setLogs((prev) =>
          prev.filter((log) => !(log.date === selectedDate && log.taskId === taskId))
        );
      } else {
        setLogs((prev) => [...prev, { date: selectedDate, taskId }]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ログのトグル（日付詳細モーダル用）
  const handleToggleLogForDate = async (
    date: string,
    taskId: string,
    isDone: boolean
  ) => {
    setIsProcessing(true);
    // 楽観的更新
    if (isDone) {
      setLogs((prev) => [...prev, { date, taskId }]);
    } else {
      setLogs((prev) =>
        prev.filter((log) => !(log.date === date && log.taskId === taskId))
      );
    }

    try {
      await server.toggleLog(date, taskId, isDone);
    } catch (err) {
      // エラー時はロールバック
      console.error("Failed to toggle log:", err);
      if (isDone) {
        setLogs((prev) =>
          prev.filter((log) => !(log.date === date && log.taskId === taskId))
        );
      } else {
        setLogs((prev) => [...prev, { date, taskId }]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // タスク追加
  const handleAddTask = async (title: string) => {
    setIsProcessing(true);
    try {
      const newTask = await server.addTask(title);
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      console.error("Failed to add task:", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // タスク更新
  const handleUpdateTask = async (taskId: string, newTitle: string) => {
    setIsProcessing(true);
    try {
      const updatedTask = await server.updateTask(taskId, newTitle);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
    } catch (err) {
      console.error("Failed to update task:", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // タスク削除
  const handleDeleteTask = async (taskId: string) => {
    setIsProcessing(true);
    try {
      await server.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      // 関連するログも削除
      setLogs((prev) => prev.filter((log) => log.taskId !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // 日付クリック（ヒートマップ）
  const handleDateClick = (date: string) => {
    setDateDetailDate(date);
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー時
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isVisible={isProcessing} />
      <Dashboard
        tasks={tasks}
        logs={logs}
        selectedDate={selectedDate}
        onToggleLog={handleToggleLog}
        onEditTask={setEditingTask}
        onAddTask={handleAddTask}
        onDateClick={handleDateClick}
      />

      {/* タスク編集モーダル */}
      <EditTaskModal
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onSave={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      {/* 日付詳細モーダル */}
      <DateDetailModal
        isOpen={dateDetailDate !== null}
        onClose={() => setDateDetailDate(null)}
        date={dateDetailDate}
        tasks={tasks}
        logs={logs}
        onToggleLog={handleToggleLogForDate}
      />
    </>
  );
}

export default App;

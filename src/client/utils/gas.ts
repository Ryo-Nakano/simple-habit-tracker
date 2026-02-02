import type { Task, Log, InitialData } from "../types";

/**
 * GASサーバーサイド関数をPromiseでラップして呼び出す汎用関数
 * @param funcName - 呼び出すGAS関数名
 * @param args - 関数に渡す引数
 * @returns Promise<T> - 関数の戻り値
 */
function runGas<T>(funcName: string, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof google === "undefined" || !google?.script?.run) {
      // ローカル開発環境ではモックを使用
      console.warn(`GAS environment not found. Using mock for: ${funcName}`);
      const mockResult = getMockResult<T>(funcName, args);
      setTimeout(() => resolve(mockResult), 300); // 擬似的な遅延
      return;
    }

    const runner = google.script.run
      .withSuccessHandler((res: T) => resolve(res))
      .withFailureHandler((err: Error) => reject(err));

    // 動的に関数を呼び出す
    const func = runner[funcName];
    if (typeof func === "function") {
      func(...args);
    } else {
      reject(new Error(`Function ${funcName} not found on google.script.run`));
    }
  });
}

// ============================================
// モックデータ（ローカル開発用）
// ============================================

const mockTasks: Task[] = [
  { id: "task-1", title: "筋トレ", created_at: "2026-01-01T00:00:00Z" },
  { id: "task-2", title: "読書", created_at: "2026-01-02T00:00:00Z" },
  { id: "task-3", title: "瞑想", created_at: "2026-01-03T00:00:00Z" },
];

const mockLogs: Log[] = [
  { date: "2026-02-01", taskId: "task-1" },
  { date: "2026-02-01", taskId: "task-2" },
  { date: "2026-02-01", taskId: "task-3" },
  { date: "2026-01-31", taskId: "task-1" },
  { date: "2026-01-31", taskId: "task-2" },
  { date: "2026-01-30", taskId: "task-1" },
  { date: "2026-01-28", taskId: "task-1" },
  { date: "2026-01-28", taskId: "task-2" },
  { date: "2026-01-28", taskId: "task-3" },
];

/**
 * ローカル開発用のモックレスポンスを返す
 */
function getMockResult<T>(funcName: string, args: unknown[]): T {
  switch (funcName) {
    case "getInitialData":
      return { tasks: mockTasks, logs: mockLogs } as T;

    case "addTask": {
      const title = args[0] as string;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        created_at: new Date().toISOString(),
      };
      mockTasks.push(newTask);
      return newTask as T;
    }

    case "deleteTask": {
      const taskId = args[0] as string;
      const index = mockTasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        mockTasks.splice(index, 1);
      }
      return true as T;
    }

    case "updateTask": {
      const [taskId, newTitle] = args as [string, string];
      const task = mockTasks.find((t) => t.id === taskId);
      if (task) {
        task.title = newTitle;
        return task as T;
      }
      throw new Error("Task not found");
    }

    case "toggleLog": {
      const [date, taskId, isDone] = args as [string, string, boolean];
      if (isDone) {
        mockLogs.push({ date, taskId });
      } else {
        const index = mockLogs.findIndex(
          (l) => l.date === date && l.taskId === taskId
        );
        if (index !== -1) {
          mockLogs.splice(index, 1);
        }
      }
      return { date, taskId, isDone } as T;
    }

    default:
      throw new Error(`Unknown function: ${funcName}`);
  }
}

// ============================================
// サーバーAPIラッパー
// ============================================

export const server = {
  /**
   * 初期データ（全タスクと全ログ）を取得
   */
  getInitialData: (): Promise<InitialData> => runGas<InitialData>("getInitialData"),

  /**
   * 新しいタスクを追加
   * @param title - タスク名
   */
  addTask: (title: string): Promise<Task> => runGas<Task>("addTask", title),

  /**
   * タスクを削除
   * @param taskId - 削除するタスクのID
   */
  deleteTask: (taskId: string): Promise<boolean> =>
    runGas<boolean>("deleteTask", taskId),

  /**
   * タスク名を更新
   * @param taskId - 更新するタスクのID
   * @param newTitle - 新しいタスク名
   */
  updateTask: (taskId: string, newTitle: string): Promise<Task> =>
    runGas<Task>("updateTask", taskId, newTitle),

  /**
   * ログの達成状態を切り替え
   * @param date - 対象日付 (YYYY-MM-DD)
   * @param taskId - タスクID
   * @param isDone - true: 達成, false: 未達成
   */
  toggleLog: (
    date: string,
    taskId: string,
    isDone: boolean
  ): Promise<{ date: string; taskId: string; isDone: boolean }> =>
    runGas("toggleLog", date, taskId, isDone),
};

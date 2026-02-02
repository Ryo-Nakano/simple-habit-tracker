/**
 * Task - タスク情報
 */
export interface Task {
  id: string;
  title: string;
  created_at: string;
}

/**
 * Log - ログ情報（日付とタスクIDの組み合わせ）
 */
export interface Log {
  date: string;
  taskId: string;
}

/**
 * InitialData - getInitialData APIのレスポンス
 */
export interface InitialData {
  tasks: Task[];
  logs: Log[];
}

/**
 * GAS環境のgoogle.script.run型定義
 */
declare global {
  interface Google {
    script: {
      run: {
        withSuccessHandler<T>(callback: (result: T) => void): Google["script"]["run"];
        withFailureHandler(callback: (error: Error) => void): Google["script"]["run"];
        [functionName: string]: any;
      };
    };
  }
  // eslint-disable-next-line no-var
  var google: Google | undefined;
}

export { };

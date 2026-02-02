import { BaseOperation } from '@/base_classes/base_operation.js';
import { Task } from '@/sheet_data/task.js';
import { Log } from '@/sheet_data/log.js';

/**
 * アプリ起動時に必要な全データを取得する Operation。
 */
export class GetInitialDataOperation extends BaseOperation {

  /**
   * 初期データ（タスクとログ）を取得する。
   * @returns {{tasks: Array, logs: Array}} タスクとログのデータ
   */
  _operation() {
    const tasks = Task.getAll();
    const logs = Log.getAll();
    return { tasks, logs };
  }
}

import { BaseOperation } from '@/base_classes/base_operation.js';
import { Task } from '@/sheet_data/task.js';
import { Log } from '@/sheet_data/log.js';

/**
 * タスクを削除する Operation。関連ログも削除する。
 */
export class DeleteTaskOperation extends BaseOperation {

  /**
   * @param {string} taskId 削除対象のタスクID
   */
  constructor(taskId) {
    super();
    this._taskId = taskId;
  }

  /**
   * タスクと関連ログを削除する。
   * @returns {boolean} 削除成功時は true
   */
  _operation() {
    // 関連ログを先に削除
    Log.deleteByTaskId(this._taskId);
    // タスクを削除
    return Task.delete(this._taskId);
  }
}

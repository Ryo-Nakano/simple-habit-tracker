import { BaseOperation } from '@/base_classes/base_operation.js';
import { Task } from '@/sheet_data/task.js';

/**
 * タスク名を変更する Operation。
 */
export class UpdateTaskOperation extends BaseOperation {

  /**
   * @param {string} taskId 対象のタスクID
   * @param {string} newTitle 新しいタスク名
   */
  constructor(taskId, newTitle) {
    super();
    this._taskId = taskId;
    this._newTitle = newTitle;
  }

  /**
   * タスク名を更新する。
   * @returns {{id: string, title: string, created_at: string}|null} 更新後のタスク情報
   */
  _operation() {
    return Task.update(this._taskId, this._newTitle);
  }
}

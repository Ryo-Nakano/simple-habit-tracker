import { BaseOperation } from '@/base_classes/base_operation.js';
import { Task } from '@/sheet_data/task.js';

/**
 * 新しいタスクを追加する Operation。
 */
export class AddTaskOperation extends BaseOperation {

  /**
   * @param {string} title タスク名
   */
  constructor(title) {
    super();
    this._title = title;
  }

  /**
   * タスクを追加する。
   * @returns {{id: string, title: string, created_at: string}} 追加されたタスク情報
   */
  _operation() {
    const task = {
      id: Utilities.getUuid(),
      title: this._title,
      created_at: new Date().toISOString(),
    };
    return Task.add(task);
  }
}

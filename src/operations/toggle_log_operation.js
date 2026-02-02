import { BaseOperation } from '@/base_classes/base_operation.js';
import { Log } from '@/sheet_data/log.js';

/**
 * 特定日付・タスクの達成状態を更新する Operation。
 */
export class ToggleLogOperation extends BaseOperation {

  /**
   * @param {string} date 対象日 (YYYY-MM-DD)
   * @param {string} taskId 対象タスクID
   * @param {boolean} isDone true ならログ追加、false ならログ削除
   */
  constructor(date, taskId, isDone) {
    super();
    this._date = date;
    this._taskId = taskId;
    this._isDone = isDone;
  }

  /**
   * ログの追加または削除を行う。
   * @returns {{date: string, taskId: string}|boolean} 追加時はログ情報、削除時は true/false
   */
  _operation() {
    if (this._isDone) {
      const log = {
        date: this._date,
        taskId: this._taskId,
        timestamp: new Date().toISOString(),
      };
      return Log.add(log);
    } else {
      return Log.delete(this._date, this._taskId);
    }
  }
}

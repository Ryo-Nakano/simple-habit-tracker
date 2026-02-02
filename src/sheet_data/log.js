import { BoundSheetData } from '@/base_classes/base_sheet_data.js';
import { SHEETS } from '@/constants.js';

/**
 * `logs` シートへのデータアクセスを提供するクラス。
 * ログの取得、追加、削除を行う。
 */
export class Log extends BoundSheetData {

  /**
   * シートオブジェクトを取得する。
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} logs シート
   */
  static get sheet() {
    return this._getSheet(SHEETS.LOGS);
  }

  /**
   * 日付を YYYY-MM-DD 形式の文字列に変換する。
   * @param {Date|string} date 日付（Date オブジェクトまたは文字列）
   * @returns {string} YYYY-MM-DD 形式の文字列
   */
  static _formatDate(date) {
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return String(date);
  }

  /**
   * 全てのログを取得する。
   * @returns {Array<{date: string, taskId: string, timestamp: string}>} ログの配列
   */
  static getAll() {
    const sheet = this.sheet;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    return data.map(row => ({
      date: this._formatDate(row[0]),
      taskId: row[1],
      timestamp: row[2],
    }));
  }

  /**
   * 指定日のログを取得する。
   * @param {string} date 対象日 (YYYY-MM-DD)
   * @returns {Array<{date: string, taskId: string, timestamp: string}>} 指定日のログ配列
   */
  static getByDate(date) {
    return this.getAll().filter(log => log.date === date);
  }

  /**
   * 新しいログを追加する。
   * @param {{date: string, taskId: string, timestamp: string}} log ログ情報
   * @returns {{date: string, taskId: string, timestamp: string}} 追加されたログ情報
   */
  static add(log) {
    const sheet = this.sheet;
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, 3).setValues([
      [log.date, log.taskId, log.timestamp]
    ]);
    return log;
  }

  /**
   * ログを削除する。
   * @param {string} date 対象日 (YYYY-MM-DD)
   * @param {string} taskId 対象タスクID
   * @returns {boolean} 削除成功時は true
   */
  static delete(date, taskId) {
    const sheet = this.sheet;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return false;

    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (let i = data.length - 1; i >= 0; i--) {
      const rowDate = this._formatDate(data[i][0]);
      if (rowDate === date && data[i][1] === taskId) {
        sheet.deleteRow(i + 2);
        return true;
      }
    }
    return false;
  }

  /**
   * 指定タスクIDに関連する全てのログを削除する。
   * @param {string} taskId 対象タスクID
   * @returns {number} 削除されたログ数
   */
  static deleteByTaskId(taskId) {
    const sheet = this.sheet;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return 0;

    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    let deletedCount = 0;

    // 逆順で削除（行番号のずれを防ぐため）
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][1] === taskId) {
        sheet.deleteRow(i + 2);
        deletedCount++;
      }
    }
    return deletedCount;
  }
}

import { BoundSheetData } from '@/base_classes/base_sheet_data.js';
import { SHEETS } from '@/constants.js';

/**
 * `tasks` シートへのデータアクセスを提供するクラス。
 * タスクの取得、追加、削除、更新を行う。
 */
export class Task extends BoundSheetData {

  /**
   * シートオブジェクトを取得する。
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} tasks シート
   */
  static get sheet() {
    return this._getSheet(SHEETS.TASKS);
  }

  /**
   * 全てのタスクを取得する。
   * @returns {Array<{id: string, title: string, created_at: string}>} タスクの配列
   */
  static getAll() {
    const sheet = this.sheet;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    return data.map(row => ({
      id: row[0],
      title: row[1],
      created_at: row[2],
    }));
  }

  /**
   * 新しいタスクを追加する。
   * @param {{id: string, title: string, created_at: string}} task タスク情報
   * @returns {{id: string, title: string, created_at: string}} 追加されたタスク情報
   */
  static add(task) {
    const sheet = this.sheet;
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, 3).setValues([
      [task.id, task.title, task.created_at]
    ]);
    return task;
  }

  /**
   * タスクを削除する。
   * @param {string} id 削除対象のタスクID
   * @returns {boolean} 削除成功時は true
   */
  static delete(id) {
    const sheet = this.sheet;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return false;

    const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.deleteRow(i + 2); // +2 because data starts at row 2
        return true;
      }
    }
    return false;
  }

  /**
   * タスク名を更新する。
   * @param {string} id 対象のタスクID
   * @param {string} title 新しいタスク名
   * @returns {{id: string, title: string, created_at: string}|null} 更新後のタスク情報、見つからない場合は null
   */
  static update(id, title) {
    const sheet = this.sheet;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return null;

    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 2, 2).setValue(title);
        return {
          id: data[i][0],
          title: title,
          created_at: data[i][2],
        };
      }
    }
    return null;
  }
}

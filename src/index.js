import { SampleOperation } from '@/operations/sample_operation.js';
import { GetInitialDataOperation } from '@/operations/get_initial_data_operation.js';
import { AddTaskOperation } from '@/operations/add_task_operation.js';
import { DeleteTaskOperation } from '@/operations/delete_task_operation.js';
import { UpdateTaskOperation } from '@/operations/update_task_operation.js';
import { ToggleLogOperation } from '@/operations/toggle_log_operation.js';

global.sampleOperation = () => {
  const operation = new SampleOperation();
  operation.run();
};

// ===========================================
// Habit Tracker API Endpoints
// ===========================================

/**
 * Web アプリケーションのエントリーポイント。
 * index.html を返す。
 * @param {Object} e リクエストパラメータ
 * @returns {GoogleAppsScript.HTML.HtmlOutput} HTML出力
 */
global.doGet = (e) => {
  return HtmlService.createHtmlOutputFromFile('index')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('habitra')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
};

/**
 * アプリ起動時に必要な全データを取得する。
 * @returns {{tasks: Array, logs: Array}} タスクとログのデータ
 */
global.getInitialData = () => {
  const operation = new GetInitialDataOperation();
  return operation.run();
};

/**
 * 新しいタスクを追加する。
 * @param {string} title タスク名
 * @returns {{id: string, title: string, created_at: string}} 追加されたタスク情報
 */
global.addTask = (title) => {
  const operation = new AddTaskOperation(title);
  return operation.run();
};

/**
 * タスクを削除する。
 * @param {string} taskId 削除対象のタスクID
 * @returns {boolean} 削除成功時は true
 */
global.deleteTask = (taskId) => {
  const operation = new DeleteTaskOperation(taskId);
  return operation.run();
};

/**
 * タスク名を変更する。
 * @param {string} taskId 対象のタスクID
 * @param {string} newTitle 新しいタスク名
 * @returns {{id: string, title: string, created_at: string}|null} 更新後のタスク情報
 */
global.updateTask = (taskId, newTitle) => {
  const operation = new UpdateTaskOperation(taskId, newTitle);
  return operation.run();
};

/**
 * 特定日付・タスクの達成状態を更新する。
 * @param {string} date 対象日 (YYYY-MM-DD)
 * @param {string} taskId 対象タスクID
 * @param {boolean} isDone true ならログ追加、false ならログ削除
 * @returns {{date: string, taskId: string}|boolean} 追加時はログ情報、削除時は true/false
 */
global.toggleLog = (date, taskId, isDone) => {
  const operation = new ToggleLogOperation(date, taskId, isDone);
  return operation.run();
};

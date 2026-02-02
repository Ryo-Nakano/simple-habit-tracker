# Phase 2: Backend (GAS) Implementation 仕様書

## 概要
Google Spreadsheetをデータベースとして利用するためのDAO、およびフロントエンドからのリクエストを処理するOperationクラスとAPIエンドポイントを実装する。

## 詳細タスク

### 1. DAO (Data Access Object) の実装
`src/sheet_data/` 配下に以下のクラスを実装する。
- **TasksData (`src/sheet_data/tasks_data.js`)**
  - 対象シート: `tasks`
  - メソッド: `getAll()`, `add(task)`, `delete(id)`, `update(id, title)`
- **LogsData (`src/sheet_data/logs_data.js`)**
  - 対象シート: `logs`
  - メソッド: `getByDate(date)`, `getAll()`, `add(log)`, `delete(date, taskId)`

### 2. Operation の実装
`src/operations/` 配下にビジネスロジックを実装する。
- **HabitTrackerOperation (`src/operations/habit_tracker_operation.js`)**
  - 継承: `BaseOperation`
  - 責務: フロントエンドからの要求（データの取得、更新）を処理し、適切なDAOメソッドを呼び出す。
  - 公開メソッド（`index.js`から呼ばれる想定）:
    - `getInitialData()`
    - `addTask(title)`
    - `deleteTask(taskId)`
    - `updateTask(taskId, newTitle)`
    - `toggleLog(date, taskId, isDone)`

### 3. API エンドポイントの実装
`src/index.js` に `google.script.run` から呼び出し可能なグローバル関数を定義する。
- `doGet(e)`: `HtmlService` を使用して、Phase 1 で生成した `index.html` を返す。
- API関数群: 上記 Operation のメソッドを呼び出し、結果を返すラッパー関数。

## 完了条件
- 定義したすべてのAPI関数が、GAS環境上でエラーなく実行でき、意図した通りにスプレッドシートの読み書きが行えること（単体テストまたは手動実行による確認）。

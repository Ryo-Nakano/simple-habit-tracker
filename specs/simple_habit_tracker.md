# Simple Habit Tracker (GAS Edition) 仕様書・設計書

## 1. プロジェクト概要

### 1.1 目的
自分専用の習慣化ツールを構築する。日々の「全てのタスク」を達成した日のみ「草（ヒートマップ）」を表示し、完全達成の継続状況を可視化することでモチベーションを維持する。

### 1.2 アーキテクチャ構成
サーバーレスかつデータベース不要（スプレッドシート利用）の構成とする。

- **Frontend**: React (TypeScript) + Vite
  - `vite-plugin-singlefile` を使用し、JS/CSS/HTMLを単一の index.html にバンドルする。
- **Backend**: Google Apps Script (GAS)
  - Web APIとして機能し、フロントエンドからのリクエストを処理する。
  - `doGet` でアプリケーション本体（HTML）を配信する。
- **Database**: Google Spreadsheet
  - データの永続化層として利用。
- **Hosting**: Google Apps Script Web App
- **Authentication**: Google アカウント認証
  - GASのデプロイ設定（Execute as: Me, Who has access: Only myself）により、開発者本人のみアクセス可能とする。アプリケーションコード内での認証実装は行わない。

## 2. データベース設計 (Spreadsheet)
スプレッドシート内に以下の2つのシートを作成する。

### 2.1 シート名: `tasks`
管理対象となる習慣（タスク）の定義を保持する。

| Column Index | Column Name | Data Type | Description |
| :--- | :--- | :--- | :--- |
| A | `id` | String (UUID) | タスクの一意なID。 |
| B | `title` | String | タスクの名称（例: "筋トレ"）。 |
| C | `created_at` | String (ISO8601) | 作成日時。ソート順序の制御に使用。 |

### 2.2 シート名: `logs`
日々の達成記録を保持する。
**「このシートに行が存在する ＝ そのタスクをその日に達成した」**とみなす（達成のみ記録）。

| Column Index | Column Name | Data Type | Description |
| :--- | :--- | :--- | :--- |
| A | `date` | String (YYYY-MM-DD) | 達成した日付。 |
| B | `task_id` | String (UUID) | `tasks` シートの `id` と対応。 |
| C | `timestamp` | String (ISO8601) | 記録操作が行われた日時。 |

**データ制約**:
`date` と `task_id` の組み合わせは論理的にユニークとして扱う。
※ 個人利用のため、GAS側での厳密な重複排除ロジック（エラーチェック等）は実装しない。

## 3. アプリケーションロジック仕様

### 3.1 草（Heatmap）の判定ロジック
「全タスク達成」を条件とする厳格なロジックを採用する。

- **Total Tasks ($N$)**: 現在 `tasks` シートに存在する有効なタスクの総数。
- **Achieved Tasks ($n$)**: 対象日付 $D$ において、`logs` シートに存在するレコードのうち、`task_id` が現在の `tasks` リストに含まれるものの数。
- **判定**:
  - $n = N$ (かつ $N > 0$) の場合: **達成 (Value = 1) -> 草が生える**
  - それ以外の場合: **未達成 (Value = 0) -> 草が生えない**
- **注意点**:
  - タスクを追加した際、過去の日付においてその新タスクのログが存在しなければ、過去の達成判定は「未達成」に変化する（過去の草が消える）。

### 3.2 フロントエンド機能要件
- **初期表示 (Dashboard)**:
  - GASからデータを非同期で取得する。
  - 過去1年分のヒートマップを描画する。
  - 「本日のタスクリスト」と各タスクの達成状況（チェックボックス）を表示する。
- **タスク操作**:
  - 新規タスクの追加。
  - 既存タスクの削除。
  - 既存タスクの名称変更。
- **記録操作 (Check-in)**:
  - タスクリストのチェックボックスをトグル操作することで、即座にGASへ更新リクエストを送信する。
  - ヒートマップ上の過去の日付をクリックした場合、その日付時点のタスクリストを表示し、遡って記録修正を可能にする。

## 4. API インターフェース設計 (GAS)
クライアント（React）からは `google.script.run` を経由して以下のサーバーサイド関数を呼び出す。
すべての関数は、成功時に正規の値を返し、失敗時には例外（Error）をスローする。

### 4.1 `getInitialData()`
アプリ起動時に必要な全データを取得する。

- **Args**: なし
- **Returns**: Object
  ```json
  {
    "tasks": [
      { "id": "uuid-1", "title": "筋トレ", "created_at": "..." },
      ...
    ],
    "logs": [
      { "date": "2026-02-01", "taskId": "uuid-1" },
      ...
    ]
  }
  ```

### 4.2 `addTask(title)`
新しいタスクを追加する。

- **Args**:
  - `title` (String): タスク名
- **Returns**: Object (追加されたタスク情報)
  ```json
  { "id": "uuid-new", "title": "...", "created_at": "..." }
  ```

### 4.3 `deleteTask(taskId)`
タスクを削除する。物理削除とする。

- **Args**:
  - `taskId` (String): 削除対象のID
- **Returns**: Boolean (`true`)
- **Side Effects**: `tasks` シートから該当行を削除。`logs` シートの該当 `task_id` を持つレコードもクリーンアップ（削除）することが望ましい。

### 4.4 `updateTask(taskId, newTitle)`
タスク名を変更する。

- **Args**:
  - `taskId` (String)
  - `newTitle` (String)
- **Returns**: Object (更新後のタスク情報)

### 4.5 `toggleLog(date, taskId, isDone)`
特定日付・タスクの達成状態を更新する。

- **Args**:
  - `date` (String): "YYYY-MM-DD"
  - `taskId` (String)
  - `isDone` (Boolean): `true`ならログ追加、`false`ならログ削除
- **Returns**: Object (更新後の最新ログリスト、または更新されたログ単体)

## 5. フロントエンド設計指針

### 5.1 通信層の実装 (GAS Client Wrapper)
`google.script.run` はコールバック形式であるため、Promise でラップしたユーティリティ関数を作成する。

```typescript
// utils/gas.ts (Interface definition)

export const server = {
  getInitialData: () => runGas<InitialData>('getInitialData'),
  addTask: (title: string) => runGas<Task>('addTask', title),
  deleteTask: (id: string) => runGas<boolean>('deleteTask', id),
  // ...
};

function runGas<T>(funcName: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!google?.script?.run) {
      // Local development mock logic here
      return reject('GAS environment not found');
    }
    google.script.run
      .withSuccessHandler((res: T) => resolve(res))
      .withFailureHandler((err: any) => reject(err))
      [funcName](...args);
  });
}
```

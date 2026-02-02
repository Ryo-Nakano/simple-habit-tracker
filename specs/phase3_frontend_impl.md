# Phase 3: Frontend Implementation 仕様書

## 概要
Reactを用いたUI実装を行い、GASバックエンドとの連携部分（通信層）を完成させる。

## 詳細タスク

### 1. 通信層ユーティリティの実装
- **ファイル**: `src/client/utils/gas.ts`
- **機能**: 
  - `google.script.run` を Promise でラップする。
  - ローカル開発時（GAS環境外）のためのモック機能（必要に応じて）。

### 2. UIコンポーネントの実装
以下のコンポーネントを `src/client/components/` 等に実装する。
- **Dashboard**: メイン画面。タスクリストとヒートマップを配置。
- **TaskList**: 今日のタスク一覧。チェックボックスで達成状況を切り替え。
- **Heatmap**: 過去の達成状況を「草」として可視化する（GitHub Contributionsライクな表示）。

### 3. ステート管理とロジック統合
- アプリケーション起動時に `getInitialData` を呼び出し、Stateを初期化する。
- ユーザー操作（チェックボックスON/OFFなど）に応じてAPIを呼び出し、Stateを楽観的更新 (Optimistic UI) またはレスポンス待ち更新する。

## 完了条件
- ローカルビルド（`vite build`）が成功すること。
- （モックデータ等を用いて）UIが正しくレンダリングされ、インタラクション（クリック等）が動作すること。

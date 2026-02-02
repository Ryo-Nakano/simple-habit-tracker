# Phase 1: Frontend Environment Setup 仕様書

## 概要
React + TypeScript + Vite を使用したフロントエンド開発環境を構築する。GASの制限（単一HTMLファイル化）に対応するためのビルド設定を行う。

## 詳細タスク

### 1. 依存パッケージのインストール
以下のパッケージをインストールする。
- **Dependencies**: `react`, `react-dom`
- **DevDependencies**: `@types/react`, `@types/react-dom`, `vite-plugin-singlefile`

### 2. ディレクトリ構成の整備
フロントエンドのソースコードをバックエンドと分離するため、`src/client` ディレクトリを作成する。
- `src/client/index.html`: エントリーポイントHTML
- `src/client/main.tsx`: Reactエントリーポイント
- `src/client/App.tsx`: メインコンポーネント（Skeleton）

### 3. ビルド設定の作成
- **ファイル名**: `vite.config.ui.ts` (新規作成)
- **設定内容**:
  - `vite-plugin-singlefile` プラグインを使用し、CSS/JSをHTMLにインライン化する。
  - build.outDir を `dist/ui` (仮) または適切な場所に設定し、最終的に `clasp push` 対象のディレクトリに配置されるように調整する（通常のGAS開発フローでは `dist` 直下がデプロイ対象となることが多いが、今回は `index.html` として出力する）。
- **npm scripts**:
  - `package.json` に `build:ui` コマンドを追加。

## 完了条件
- `npm run build:ui` を実行すると、単一の `index.html` ファイルが生成されること。
- 生成された `index.html` をブラウザで開いた際（またはGASにデプロイした際）、"Hello React" 等の初期表示が確認できること。

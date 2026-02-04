# Deploy Automation & WebApp Config Spec

## 概要
`npm run deploy` コマンドを拡張し、ビルド、GASへのプッシュ、そして特定の Deployment ID に対する Web アプリケーションの再デプロイを一貫して行えるようにする。また、Web アプリケーションとして動作させるために必要な設定を `appsscript.json` に追加する。

## 現状 (As-Is)
- `package.json` の `deploy` コマンド: `npm run build && clasp push`
   - ビルドとプッシュのみで、デプロイ（Webアプリの更新）は行われない。
- `appsscript.json`: `webapp` 設定が存在しない。

## 要件 (To-Be)

### 1. `appsscript.json` の設定変更
Web アプリケーションとして公開するための設定を追加する。

- **`webapp` フィールドの追加**:
   - `executeAs`: スクリプトを実行するユーザー（`USER_DEPLOYING` or `USER_ACCESSING`）
   - `access`: アプリケーションにアクセスできるユーザー（`MYSELF`, `DOMAIN`, `ANYONE`, `ANYONE_ANONYMOUS`）

### 2. `npm run deploy` コマンドの更新
以下のフローを1コマンドで実行可能にする。

1.  **Build**: `npm run build` (既存: GAS と UI のビルド)
2.  **Push**: `clasp push` (既存: GASプロジェクトへのアップロード)
3.  **Deploy**: `clasp deploy --deploymentId <DEPLOYMENT_ID>` (新規: 指定したIDでの再デプロイ)

## 実装計画

### 手順
1.  `appsscript.json` に `webapp` 設定を追加する。
2.  `package.json` の `scripts` を修正する。
   - Deployment ID の管理方法を決定し、コマンドに組み込む。

## 未確定事項 (確認が必要な点)

以下の点について方針を決定する必要がある。

1.  **Deployment ID の管理方法**:
   - `package.json` に直接記述する？ (例: `config` 変数を使用、またはコマンド直書き)
   - 環境変数 (`.env`) から読み込む？
   - 毎回引数で渡す？
2.  **Web アプリケーションの権限設定**:
   - `executeAs`: `USER_DEPLOYING` (デプロイしたユーザーとして実行) でよいか？
   - `access`: `MYSELF` (自分のみ), `DOMAIN` (同ドメイン), `ANYONE` (全員) のどれにするか？

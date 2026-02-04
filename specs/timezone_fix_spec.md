# タイムゾーン処理の統一

## 概要
- フロントエンドで `toISOString()` を使用して日付文字列を生成している箇所があり、UTC タイムゾーンで変換されるため日本時間 (JST) で深夜〜早朝に操作すると「選択日 - 1日」がモーダルに表示されるバグが発生している
- バックエンド (`sheet_data/log.js`) ではローカルタイムゾーンを使用した `_formatDate()` が実装済みだが、フロントエンドでは統一されていない
- フロントエンド全体でローカルタイムゾーンを使用するよう統一する

## 仕様
### 機能要件
- カレンダーで日付をクリックした際、ローカルタイムゾーンで正しい日付がモーダルに表示される
- 「今日」の日付判定がローカルタイムゾーンで正しく行われる
- フロントエンド・バックエンド間で日付文字列の形式 (`YYYY-MM-DD`) は変更なし

### UI/メッセージ
- 変更なし（バグ修正のみ）

### 制約・前提
- バックエンドの `Log._formatDate()` がすでにローカルタイムゾーンを使用している
- 日付形式は `YYYY-MM-DD` で統一済み

## 実装計画
### 使用するクラス・ファイル
- 新規: `src/client/utils/date.ts` - 日付ユーティリティ関数
- 修正: `src/client/App.tsx` - `getTodayString()` を共通ユーティリティへ置き換え
- 修正: `src/client/components/CalendarViews/MonthlyView.tsx` - `formatDate()` を共通ユーティリティへ置き換え
- 修正: `src/client/components/CalendarViews/QuarterlyView.tsx` - `formatDate()` を共通ユーティリティへ置き換え

### 処理フロー
1. `src/client/utils/date.ts` を新規作成し、ローカルタイムゾーンで日付を `YYYY-MM-DD` 形式に変換する `formatDateToString()` 関数を実装
2. `App.tsx` の `getTodayString()` を新しいユーティリティを使用するよう修正
3. `MonthlyView.tsx` の `formatDate()` を新しいユーティリティに置き換え
4. `QuarterlyView.tsx` の `formatDate()` を新しいユーティリティに置き換え

### 技術的な判断・注意点
- **なぜこのアプローチを選んだか**: 日付変換ロジックを一箇所にまとめることで、将来的な変更や保守が容易になる。また、バックエンドの `_formatDate()` と同じロジックを使用することでフロントエンド・バックエンド間の整合性が保証される
- **考慮すべきエッジケース**: 
  - 深夜0時前後での日付切り替わり
  - 異なるタイムゾーンからのアクセス（現状はローカルタイムゾーンに依存する設計のため変更なし）

## 変更差分

### 新規ファイル: `src/client/utils/date.ts`
```typescript
/**
 * Date オブジェクトをローカルタイムゾーンで YYYY-MM-DD 形式の文字列に変換する
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得する
 */
export function getTodayString(): string {
  return formatDateToString(new Date());
}
```

### 修正: `App.tsx`
```diff
+import { getTodayString } from "./utils/date";

-/**
- * 今日の日付をYYYY-MM-DD形式で取得
- */
-function getTodayString(): string {
-  const today = new Date();
-  return today.toISOString().split("T")[0];
-}
```

### 修正: `MonthlyView.tsx`
```diff
+import { formatDateToString } from "../../utils/date";

-  // YYYY-MM-DD 文字列変換
-  const formatDate = (d: Date) => d.toISOString().split("T")[0];

   // ...
-  const dateStr = formatDate(date);
+  const dateStr = formatDateToString(date);
```

### 修正: `QuarterlyView.tsx`
```diff
+import { formatDateToString } from "../../utils/date";

-  // YYYY-MM-DD 文字列変換
-  const formatDate = (d: Date) => d.toISOString().split("T")[0];

   // ...
-  const dateStr = formatDate(date);
+  const dateStr = formatDateToString(date);
```

# タスク名編集バグ修正

## 概要
- タスク名を編集しようとしても、入力が即座に元の値に戻されてしまい、編集ができないバグを修正する
- 原因はコンポーネントの再レンダリング時の状態同期ロジックの不備

## 仕様
### 現象
1. タスク編集モーダルを開く
2. タスク名の入力欄で文字を入力する
3. 入力が即座に元のタスク名に戻される
4. タスク名が変更できない

### 原因分析
`EditTaskModal.tsx` の28-30行目:
```typescript
if (task && title !== task.title && !isSaving) {
  setTitle(task.title);
}
```

この条件分岐がレンダリング中に直接実行されているため：
1. ユーザーが入力すると `onChange` で `title` が更新される
2. 再レンダリング時、`title !== task.title` が `true` になる
3. `setTitle(task.title)` で元のタスク名に即時リセットされる
4. 結果として入力が無効になる

### 修正方針
レンダリング中に `setTitle` を呼ぶのではなく、`useEffect` を使用して `task` の変更時のみ `title` を同期する。

## 実装計画
### 変更ファイル
- `src/client/components/EditTaskModal.tsx`

### 処理フロー
1. レンダリング中の条件分岐（28-30行目）を削除
2. `useEffect` を追加して `task` が変更されたときのみ `title` を同期

### 修正後のコード
```typescript
import { useState, useEffect } from "react";

// ... 略 ...

export function EditTaskModal({...}: EditTaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  // ... 略 ...

  // task が変わったときのみ title を同期
  useEffect(() => {
    if (task) {
      setTitle(task.title);
    }
  }, [task]);

  // 以下の条件分岐を削除:
  // if (task && title !== task.title && !isSaving) {
  //   setTitle(task.title);
  // }

  // ... 以下略 ...
}
```

### 技術的な判断・注意点
- `useEffect` の依存配列に `task` のみを指定することで、モーダルが開いて新しいタスクが渡されたときだけ `title` が初期化される
- ユーザーの入力中は `task` が変更されないため、入力が保持される

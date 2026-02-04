# タスク並び替え機能

## 概要

### 背景・目的
- ユーザーがタスクリストの表示順序をドラッグ&ドロップで自由に変更できるようにする
- 重要度や優先度に応じてタスクを並び替えたいというニーズに対応
- 並び順はローカルストレージに保存し、ブラウザをリロードしても維持される

### スコープ
- **対象**: フロントエンドのみ（バックエンド/スプレッドシートの変更なし）
- **保存先**: ローカルストレージ（デバイス間同期なし）

---

## 仕様

### 機能要件

#### 1. ドラッグ&ドロップ操作

| 項目 | 仕様 |
|------|------|
| 操作方法 | ドラッグハンドル（タスク行左端のアイコン）をドラッグして位置を変更 |
| デスクトップ対応 | マウスによるドラッグ操作 |
| モバイル対応 | タッチによるドラッグ操作（長押し不要、ハンドルをタッチしてそのままドラッグ） |
| キーボード対応 | なし（将来的に追加可能だが今回はスコープ外） |

#### 2. 並び順の永続化

| 項目 | 仕様 |
|------|------|
| 保存先 | ローカルストレージ |
| キー名 | `simple-habit-tracker:taskOrder` |
| 保存形式 | JSON配列（タスクIDの文字列配列） |
| 保存タイミング | ドラッグ操作完了時（ドロップ時） |

**保存データ例**:
```json
["task-uuid-1", "task-uuid-3", "task-uuid-2", "task-uuid-4"]
```

#### 3. 適用範囲

| コンポーネント | ドラッグ操作 | 並び順の適用 |
|----------------|-------------|-------------|
| `TaskList`（今日のタスクリスト） | ○ 可能 | ○ 適用 |
| `DateDetailModal`（過去日付のモーダル） | × 不可 | ○ 適用（同じ順序で表示） |

#### 4. エッジケースの処理

| ケース | 動作 |
|--------|------|
| 新規タスク追加 | リストの末尾に追加（現状維持） |
| タスク削除 | 保存済み順序から該当IDを自動除外（明示的な削除処理は不要、次回ソート時に無視される） |
| ローカルストレージにデータなし | サーバーから取得した順序で表示（created_at順） |
| 保存済みIDに存在しないタスク | 無視して末尾に配置しない（フィルタリング） |
| 保存済みIDにないタスク（新規追加分） | 末尾に配置 |

---

### UI仕様

#### ドラッグハンドル

- **位置**: タスク行の左端（チェックボックスの左側）
- **アイコン**: 縦3本線（grip/hamburger icon）`≡` または6点グリッド `⠿`
- **サイズ**: 24x24px（タッチ操作のため最低44x44pxのタッチ領域を確保）
- **色**: `text-gray-400`（ホバー時: `text-gray-600`）

**レイアウト変更（TaskItem）**:
```
変更前: [checkbox] [title] [edit-button]
変更後: [drag-handle] [checkbox] [title] [edit-button]
```

#### ドラッグ中のビジュアル

| 状態 | スタイル |
|------|---------|
| ドラッグ中の要素 | `opacity: 0.8`, `shadow-lg`, `scale(1.02)` |
| ドロップ位置のプレースホルダー | 高さを維持した空白エリア（または薄い背景色で表示） |

#### DateDetailModalの表示

- ドラッグハンドルは表示しない（ドラッグ操作不可）
- 並び順は `TaskList` と同じ順序を適用

---

## 実装計画

### ライブラリ選定

- **使用ライブラリ**: `@dnd-kit/core` + `@dnd-kit/sortable`
- **選定理由**:
  - `react-beautiful-dnd` はAtlassianによりアーカイブ済み（メンテナンス終了）
  - タッチ操作（モバイル対応）が標準装備
  - モジュラー設計で軽量（~15KB）
  - ドキュメントが充実しており実装例が豊富

### ファイル構成

#### 新規作成

| ファイル | 説明 |
|----------|------|
| `src/client/utils/taskOrder.ts` | ローカルストレージへの保存/読み込みユーティリティ |
| `src/client/hooks/useTaskOrder.ts` | 並び替えロジックのカスタムフック |
| `src/client/components/SortableTaskItem.tsx` | ドラッグ可能なラッパーコンポーネント |

#### 変更

| ファイル | 変更内容 |
|----------|----------|
| `src/client/components/TaskList.tsx` | DndContextとSortableContextでラップ、ドラッグ終了時の順序保存 |
| `src/client/components/TaskItem.tsx` | ドラッグハンドルの追加、propsに `dragHandleProps` を追加 |
| `src/client/components/DateDetailModal.tsx` | `useTaskOrder` フックを使用して並び順を適用 |
| `src/client/App.tsx` | useTaskOrder フックの初期化（必要に応じて） |

---

### 詳細設計

#### 1. `src/client/utils/taskOrder.ts`

```typescript
const STORAGE_KEY = 'simple-habit-tracker:taskOrder';

/**
 * ローカルストレージからタスク順序を取得
 * @returns タスクIDの配列、存在しない場合は空配列
 */
export function getTaskOrder(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * タスク順序をローカルストレージに保存
 * @param order タスクIDの配列
 */
export function saveTaskOrder(order: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

/**
 * タスク配列を保存済み順序でソート
 * @param tasks ソート対象のタスク配列
 * @param savedOrder 保存済みの順序（タスクID配列）
 * @returns ソート済みのタスク配列
 */
export function sortTasksByOrder<T extends { id: string }>(
  tasks: T[],
  savedOrder: string[]
): T[] {
  if (savedOrder.length === 0) return tasks;

  const orderMap = new Map(savedOrder.map((id, index) => [id, index]));
  const sorted = [...tasks].sort((a, b) => {
    const orderA = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  return sorted;
}
```

#### 2. `src/client/hooks/useTaskOrder.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { getTaskOrder, saveTaskOrder, sortTasksByOrder } from '../utils/taskOrder';
import type { Task } from '../types';

export function useTaskOrder(tasks: Task[]) {
  const [order, setOrder] = useState<string[]>([]);

  // 初期化時にローカルストレージから読み込み
  useEffect(() => {
    setOrder(getTaskOrder());
  }, []);

  // ソート済みタスクを返す
  const sortedTasks = sortTasksByOrder(tasks, order);

  // 順序を更新して保存
  const updateOrder = useCallback((newOrder: string[]) => {
    setOrder(newOrder);
    saveTaskOrder(newOrder);
  }, []);

  return { sortedTasks, order, updateOrder };
}
```

#### 3. `TaskList.tsx` の変更ポイント

```typescript
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useTaskOrder } from '../hooks/useTaskOrder';

// センサー設定（マウス + タッチ対応）
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(TouchSensor)
);

// ドラッグ終了時のハンドラ
function handleDragEnd(event) {
  const { active, over } = event;
  if (active.id !== over?.id) {
    const oldIndex = sortedTasks.findIndex(t => t.id === active.id);
    const newIndex = sortedTasks.findIndex(t => t.id === over.id);
    const newOrder = arrayMove(sortedTasks.map(t => t.id), oldIndex, newIndex);
    updateOrder(newOrder);
  }
}
```

#### 4. `TaskItem.tsx` の変更ポイント

```typescript
interface TaskItemProps {
  // 既存のprops...
  dragHandleListeners?: SyntheticListenerMap; // dnd-kitからのリスナー
  dragHandleAttributes?: DraggableAttributes; // dnd-kitからの属性
}

// ドラッグハンドルのJSX
<button
  {...dragHandleListeners}
  {...dragHandleAttributes}
  className="p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
  aria-label="ドラッグして並び替え"
>
  <svg className="w-5 h-5" /* grip icon */ />
</button>
```

---

### 処理フロー

```
1. アプリ起動
   └─> useTaskOrder フックが localStorage から順序を読み込み

2. タスクリスト表示
   └─> sortTasksByOrder で tasks を並び替えて表示

3. ドラッグ操作
   ├─> PointerSensor / TouchSensor がドラッグを検知
   ├─> DndContext 内でドラッグ状態を管理
   └─> SortableContext がリスト内の位置を追跡

4. ドロップ（ドラッグ終了）
   ├─> handleDragEnd で新しい順序を計算
   ├─> updateOrder で state 更新 + localStorage 保存
   └─> React が並び替え後のリストを再レンダリング

5. DateDetailModal 表示
   └─> 同じ useTaskOrder から取得した順序を適用
       （ドラッグ操作は不可、表示のみ）
```

---

## 検証計画

### 手動テスト

1. **ドラッグ&ドロップ動作確認**
   - タスクを3つ以上追加
   - ドラッグハンドルをドラッグしてタスクの順序を変更
   - リロード後も順序が維持されていることを確認

2. **モバイル対応確認**
   - スマホ実機またはブラウザのデバイスエミュレーターで確認
   - タッチでドラッグハンドルを操作して並び替え可能か確認

3. **DateDetailModal での順序確認**
   - TaskList で並び替えを行った後
   - DateDetailModal を開いて同じ順序で表示されることを確認

4. **新規タスク追加時の動作確認**
   - 既存タスクを並び替えた後
   - 新規タスクを追加
   - 新規タスクがリスト末尾に追加されることを確認

5. **タスク削除時の動作確認**
   - 並び替えたタスクのうち1つを削除
   - 残りのタスクの順序が維持されることを確認

### ビルド確認

```bash
npm run build
```
- TypeScriptのコンパイルエラーがないこと
- ビルドが正常に完了すること

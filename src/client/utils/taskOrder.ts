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

  // orderMapにないものは末尾に追加するため、最大値を設定
  // 安定したソートにするため、orderが同じ(ない)場合は元の順序を維持したいが、
  // JavaScriptのsortは必ずしも安定ではない。
  // ここでは単純にマップにあるものを優先し、ないものは後ろにする。

  return [...tasks].sort((a, b) => {
    const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : Number.MAX_SAFE_INTEGER;

    if (orderA === orderB) {
      return 0; // 元の順序に依存（ブラウザ実装依存）
    }
    return orderA - orderB;
  });
}

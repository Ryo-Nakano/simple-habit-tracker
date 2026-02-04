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

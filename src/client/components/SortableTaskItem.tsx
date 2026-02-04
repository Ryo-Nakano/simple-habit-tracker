import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItem } from "./TaskItem";
import type { Task } from "../types";

interface SortableTaskItemProps {
  task: Task;
  isCompleted: boolean;
  onToggle: (taskId: string, isDone: boolean) => void;
  onEdit: (task: Task) => void;
}

export function SortableTaskItem({ task, ...props }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        {...props}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
      />
    </div>
  );
}

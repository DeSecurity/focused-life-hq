import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar, CheckCircle2, Circle, Clock, GripVertical, MoreHorizontal, Sun } from 'lucide-react';
import { Task, Priority } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  showProject?: boolean;
  isDraggable?: boolean;
}

const priorityColors: Record<Priority, string> = {
  critical: 'border-l-priority-critical',
  high: 'border-l-priority-high',
  medium: 'border-l-priority-medium',
  low: 'border-l-priority-low',
};

const priorityDots: Record<Priority, string> = {
  critical: 'bg-priority-critical',
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
};

export function TaskCard({ task, showProject = true, isDraggable = true }: TaskCardProps) {
  const { currentProfile, updateTaskStatus, toggleTaskToday, deleteTask } = useApp();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const project = task.projectId 
    ? currentProfile.projects.find(p => p.id === task.projectId)
    : null;

  const checklistProgress = task.checklistItems.length > 0
    ? task.checklistItems.filter(c => c.done).length / task.checklistItems.length
    : null;

  const isDone = task.status === 'done';

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isDone;

  const handleToggleDone = () => {
    updateTaskStatus(task.id, isDone ? 'todo' : 'done');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-card rounded-lg border border-border p-3 transition-all duration-200',
        'hover:border-muted-foreground/30 hover:shadow-lg hover:shadow-black/5',
        priorityColors[task.priority],
        'border-l-2',
        isDragging && 'opacity-50 shadow-xl',
        isDone && 'opacity-60'
      )}
    >
      <div className="flex gap-3">
        {/* Drag Handle */}
        {isDraggable && (
          <button
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* Checkbox */}
        <button
          onClick={handleToggleDone}
          className={cn(
            'mt-0.5 shrink-0 transition-colors',
            isDone ? 'text-status-done' : 'text-muted-foreground hover:text-primary'
          )}
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'text-sm font-medium text-foreground leading-snug',
              isDone && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </h4>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => toggleTaskToday(task.id)}>
                  <Sun className="h-4 w-4 mr-2" />
                  {task.isToday ? 'Remove from Today' : 'Add to Today'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => deleteTask(task.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {showProject && project && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {project.title}
              </span>
            )}

            {task.dueDate && (
              <span className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue ? 'text-destructive' : 'text-muted-foreground'
              )}>
                <Calendar className="h-3 w-3" />
                {formatDueDate(task.dueDate)}
              </span>
            )}

            {task.isToday && !isDone && (
              <span className="flex items-center gap-1 text-xs text-primary">
                <Sun className="h-3 w-3" />
                Today
              </span>
            )}

            {task.estimateMinutes && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.estimateMinutes}m
              </span>
            )}

            {/* Priority dot */}
            <span className={cn('h-2 w-2 rounded-full', priorityDots[task.priority])} />
          </div>

          {/* Checklist Progress */}
          {checklistProgress !== null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${checklistProgress * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {task.checklistItems.filter(c => c.done).length}/{task.checklistItems.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

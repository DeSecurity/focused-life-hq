import { useMemo } from 'react';
import { Inbox, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TaskCard } from '@/components/shared/TaskCard';
import { Button } from '@/components/ui/button';

export function BacklogView() {
  const { currentProfile, setQuickAddOpen } = useApp();

  const backlogTasks = useMemo(() => {
    return currentProfile.tasks
      .filter(t => !t.dueDate && t.status !== 'done' && !t.isToday)
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [currentProfile.tasks]);

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center glow-sm">
            <Inbox className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Backlog</h1>
            <p className="text-muted-foreground">Unscheduled tasks waiting to be planned</p>
          </div>
        </div>
        <Button onClick={() => setQuickAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Tasks */}
      {backlogTasks.length > 0 ? (
        <div className="space-y-2">
          {backlogTasks.map(task => (
            <TaskCard key={task.id} task={task} isDraggable={false} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Inbox className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Backlog is empty</h3>
          <p className="text-muted-foreground mb-4">
            All tasks are either scheduled or completed
          </p>
          <Button onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
}

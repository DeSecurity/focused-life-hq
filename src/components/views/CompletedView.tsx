import { useMemo } from 'react';
import { CheckCircle2, Calendar } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TaskCard } from '@/components/shared/TaskCard';
import { format, startOfDay, subDays } from 'date-fns';

export function CompletedView() {
  const { currentProfile } = useApp();

  const groupedByDay = useMemo(() => {
    const completed = currentProfile.tasks
      .filter(t => t.status === 'done' && t.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

    const grouped: { date: string; label: string; tasks: typeof completed }[] = [];
    const today = startOfDay(new Date());

    completed.forEach(task => {
      const taskDate = startOfDay(new Date(task.completedAt!));
      const dateKey = taskDate.toISOString();
      
      let existing = grouped.find(g => g.date === dateKey);
      if (!existing) {
        let label = format(taskDate, 'EEEE, MMMM d');
        if (taskDate.getTime() === today.getTime()) {
          label = 'Today';
        } else if (taskDate.getTime() === subDays(today, 1).getTime()) {
          label = 'Yesterday';
        }
        
        existing = { date: dateKey, label, tasks: [] };
        grouped.push(existing);
      }
      existing.tasks.push(task);
    });

    return grouped;
  }, [currentProfile.tasks]);

  const totalCompleted = currentProfile.tasks.filter(t => t.status === 'done').length;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center glow-sm">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Completed</h1>
            <p className="text-muted-foreground">{totalCompleted} tasks completed</p>
          </div>
        </div>
      </div>

      {/* Grouped Tasks */}
      {groupedByDay.length > 0 ? (
        <div className="space-y-8">
          {groupedByDay.map(group => (
            <section key={group.date}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground">{group.label}</h2>
                <span className="text-xs text-status-done bg-status-done/10 px-2 py-0.5 rounded-full">
                  {group.tasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {group.tasks.map(task => (
                  <TaskCard key={task.id} task={task} isDraggable={false} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <CheckCircle2 className="h-16 w-16 text-green-500/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No completed tasks yet</h3>
          <p className="text-muted-foreground">
            Complete some tasks to see your progress here
          </p>
        </div>
      )}
    </div>
  );
}

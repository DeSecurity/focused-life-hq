import { useMemo } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TaskCard } from '@/components/shared/TaskCard';
import { addDays, format, isToday, isTomorrow, startOfDay } from 'date-fns';

export function ThisWeekView() {
  const { currentProfile } = useApp();

  const weekDays = useMemo(() => {
    const today = startOfDay(new Date());
    const days: { date: Date; label: string; tasks: typeof currentProfile.tasks }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      let label = format(date, 'EEEE, MMMM d');
      if (i === 0) label = 'Today - ' + format(date, 'MMMM d');
      else if (i === 1) label = 'Tomorrow - ' + format(date, 'MMMM d');

      const tasks = currentProfile.tasks.filter(task => {
        if (!task.dueDate || task.status === 'done') return false;
        const dueDate = startOfDay(new Date(task.dueDate));
        return dueDate.getTime() === date.getTime();
      });

      days.push({ date, label, tasks });
    }

    return days;
  }, [currentProfile.tasks]);

  const overdueTasks = useMemo(() => {
    const today = startOfDay(new Date());
    return currentProfile.tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate = startOfDay(new Date(task.dueDate));
      return dueDate < today;
    });
  }, [currentProfile.tasks]);

  const totalTasks = weekDays.reduce((acc, day) => acc + day.tasks.length, 0) + overdueTasks.length;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center glow-sm">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">This Week</h1>
            <p className="text-muted-foreground">{totalTasks} tasks scheduled</p>
          </div>
        </div>
      </div>

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <h2 className="text-sm font-semibold text-destructive">
              Overdue ({overdueTasks.length})
            </h2>
          </div>
          <div className="space-y-2 p-4 bg-destructive/5 rounded-xl border border-destructive/20">
            {overdueTasks.map(task => (
              <TaskCard key={task.id} task={task} isDraggable={false} />
            ))}
          </div>
        </section>
      )}

      {/* Week Days */}
      <div className="space-y-6">
        {weekDays.map((day, index) => (
          <section key={day.date.toISOString()}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <h2 className={`text-sm font-semibold ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {day.label}
              </h2>
              {day.tasks.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {day.tasks.length}
                </span>
              )}
            </div>

            {day.tasks.length > 0 ? (
              <div className="space-y-2">
                {day.tasks.map(task => (
                  <TaskCard key={task.id} task={task} isDraggable={false} />
                ))}
              </div>
            ) : (
              <div className="py-4 px-4 bg-card/50 rounded-lg border border-border/50 text-center">
                <p className="text-sm text-muted-foreground">No tasks scheduled</p>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

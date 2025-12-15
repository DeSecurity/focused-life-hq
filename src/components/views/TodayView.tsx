import { useMemo } from 'react';
import { Sun, Calendar, Plus, Star } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TaskCard } from '@/components/shared/TaskCard';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export function TodayView() {
  const { currentProfile, setQuickAddOpen } = useApp();

  const todayTasks = useMemo(() => {
    return currentProfile.tasks
      .filter(t => t.isToday && t.status !== 'done')
      .sort((a, b) => {
        // Sort by priority then by creation date
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [currentProfile.tasks]);

  const completedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return currentProfile.tasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });
  }, [currentProfile.tasks]);

  const focusProjects = useMemo(() => {
    return currentProfile.projects.filter(p => p.isFocus && !p.archived);
  }, [currentProfile.projects]);

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center glow-sm">
            <Sun className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Today</h1>
            <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
          </div>
        </div>
      </div>

      {/* Focus Projects */}
      {focusProjects.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Focus Projects</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {focusProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Today's Tasks */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Today's Tasks
            </h2>
            <span className="text-sm text-muted-foreground">({todayTasks.length})</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>

        {todayTasks.length > 0 ? (
          <div className="space-y-2">
            {todayTasks.map(task => (
              <TaskCard key={task.id} task={task} isDraggable={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Sun className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks for today</h3>
            <p className="text-muted-foreground mb-4">
              Add tasks to your day to stay focused
            </p>
            <Button onClick={() => setQuickAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        )}
      </section>

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Completed Today
            </h2>
            <span className="text-sm text-status-done">({completedToday.length})</span>
          </div>
          <div className="space-y-2 opacity-60">
            {completedToday.map(task => (
              <TaskCard key={task.id} task={task} isDraggable={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

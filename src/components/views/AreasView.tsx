import { useMemo } from 'react';
import { 
  Layers, 
  Briefcase, 
  Heart, 
  Users, 
  BookOpen, 
  Wallet, 
  Home, 
  Sparkles,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const areaIcons: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  heart: Heart,
  users: Users,
  book: BookOpen,
  wallet: Wallet,
  home: Home,
  sparkles: Sparkles,
};

const areaColors: Record<string, string> = {
  'area-work': 'from-blue-500 to-blue-600',
  'area-health': 'from-green-500 to-emerald-600',
  'area-relationships': 'from-pink-500 to-rose-600',
  'area-learning': 'from-purple-500 to-violet-600',
  'area-finances': 'from-yellow-500 to-amber-600',
  'area-home': 'from-orange-500 to-orange-600',
  'area-personal': 'from-cyan-500 to-teal-600',
};

export function AreasView() {
  const { currentProfile, setCurrentView, setSelectedProjectId } = useApp();

  const areaStats = useMemo(() => {
    return currentProfile.areas.map(area => {
      const projects = currentProfile.projects.filter(p => p.areaId === area.id && !p.archived);
      const tasks = currentProfile.tasks.filter(t => {
        if (t.areaId === area.id) return true;
        const project = currentProfile.projects.find(p => p.id === t.projectId);
        return project?.areaId === area.id;
      });
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const progress = tasks.length > 0 ? completedTasks / tasks.length : 0;

      return {
        area,
        projects: projects.length,
        totalTasks: tasks.length,
        completedTasks,
        progress,
      };
    });
  }, [currentProfile]);

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center glow-sm">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Areas of Life</h1>
            <p className="text-muted-foreground">Organize your life into meaningful categories</p>
          </div>
        </div>
      </div>

      {/* Areas Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {areaStats.map(({ area, projects, totalTasks, completedTasks, progress }) => {
          const Icon = areaIcons[area.icon || 'sparkles'] || Sparkles;
          const gradient = areaColors[area.color || 'area-personal'] || 'from-primary to-accent';

          return (
            <div
              key={area.id}
              className={cn(
                'group relative bg-card rounded-xl border border-border p-5 transition-all duration-200',
                'hover:border-muted-foreground/30 hover:shadow-lg cursor-pointer'
              )}
            >
              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className={cn(
                  'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
                  gradient
                )}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg">{area.name}</h3>
                  {area.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{area.description}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {projects} project{projects !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {completedTasks}/{totalTasks} tasks
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500 bg-gradient-to-r', gradient)}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

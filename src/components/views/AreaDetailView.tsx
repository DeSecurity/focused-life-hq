import { useMemo } from 'react';
import { ArrowLeft, FolderKanban, CheckSquare, Layers, Briefcase, Heart, Users, BookOpen, Wallet, Home, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TaskCard } from '@/components/shared/TaskCard';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

export function AreaDetailView() {
  const { 
    currentProfile, 
    selectedAreaId, 
    setCurrentView, 
    setSelectedAreaId,
    setSelectedProjectId,
  } = useApp();

  const area = currentProfile.areas.find(a => a.id === selectedAreaId);
  
  const projects = useMemo(() => {
    if (!area) return [];
    return currentProfile.projects
      .filter(p => p.areaId === area.id && !p.archived)
      .sort((a, b) => {
        const statusOrder = { active: 0, backlog: 1, 'on-hold': 2, completed: 3, cancelled: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }, [area, currentProfile.projects]);

  const tasks = useMemo(() => {
    if (!area) return [];
    return currentProfile.tasks.filter(t => {
      // Task directly assigned to area
      if (t.areaId === area.id) return true;
      // Task belongs to a project in this area
      const project = currentProfile.projects.find(p => p.id === t.projectId);
      return project?.areaId === area.id;
    }).sort((a, b) => {
      // Sort by status, then priority
      const statusOrder = { 'in-progress': 0, 'todo': 1, 'backlog': 2, 'blocked': 3, 'done': 4 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [area, currentProfile.tasks, currentProfile.projects]);

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (!area) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Area not found</p>
        <Button variant="ghost" onClick={() => setCurrentView('areas')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Areas
        </Button>
      </div>
    );
  }

  const Icon = areaIcons[area.icon || 'sparkles'] || Layers;
  const gradient = areaColors[area.color || 'area-personal'] || 'from-primary to-accent';

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => {
            setCurrentView('areas');
            setSelectedAreaId(null);
          }}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Areas
        </Button>

        <div className="flex items-start gap-4">
          <div className={cn(
            'h-16 w-16 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
            gradient
          )}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{area.name}</h1>
            {area.description && (
              <p className="text-muted-foreground">{area.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Projects</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{projects.length}</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Tasks</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{tasks.length}</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="h-4 w-4 text-status-done" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{completedTasks}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-foreground">{completedTasks}/{tasks.length} tasks</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Projects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="cursor-pointer"
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tasks Section */}
      {tasks.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">All Tasks</h2>
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} showProject={true} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {projects.length === 0 && tasks.length === 0 && (
        <div className="text-center py-12">
          <div className={cn(
            'h-16 w-16 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-4',
            gradient
          )}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">No projects or tasks in this area yet</p>
        </div>
      )}
    </div>
  );
}


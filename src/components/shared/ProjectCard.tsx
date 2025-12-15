import { format } from 'date-fns';
import { Calendar, MoreHorizontal, Star, StarOff } from 'lucide-react';
import { Project, ProjectStatus } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const statusColors: Record<ProjectStatus, string> = {
  backlog: 'bg-status-backlog/20 text-status-backlog',
  active: 'bg-status-inprogress/20 text-status-inprogress',
  'on-hold': 'bg-status-blocked/20 text-status-blocked',
  completed: 'bg-status-done/20 text-status-done',
  cancelled: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<ProjectStatus, string> = {
  backlog: 'Backlog',
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { currentProfile, updateProject, deleteProject, setCurrentView, setSelectedProjectId } = useApp();

  const area = currentProfile.areas.find(a => a.id === project.areaId);
  const tasks = currentProfile.tasks.filter(t => t.projectId === project.id);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? completedTasks / tasks.length : 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setSelectedProjectId(project.id);
      setCurrentView('project-detail');
    }
  };

  const toggleFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateProject(project.id, { isFocus: !project.isFocus });
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative bg-card rounded-xl border border-border p-4 cursor-pointer transition-all duration-200',
        'hover:border-muted-foreground/30 hover:shadow-lg hover:shadow-black/5',
        'hover:translate-y-[-2px]',
        project.isFocus && 'ring-1 ring-primary/50'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {project.isFocus && (
              <Star className="h-4 w-4 text-primary fill-primary shrink-0" />
            )}
            <h3 className="font-semibold text-foreground truncate">{project.title}</h3>
          </div>
          {area && (
            <span className="text-xs text-muted-foreground">{area.name}</span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={toggleFocus}>
              {project.isFocus ? (
                <>
                  <StarOff className="h-4 w-4 mr-2" />
                  Remove from Focus
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Add to Focus
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                deleteProject(project.id);
              }}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {project.description}
        </p>
      )}

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedTasks}/{tasks.length} tasks</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className={cn('text-xs', statusColors[project.status])}>
          {statusLabels[project.status]}
        </Badge>

        {project.dueDate && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(project.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}

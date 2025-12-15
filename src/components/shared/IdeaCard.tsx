import { FolderKanban, Lightbulb, MoreHorizontal, CheckSquare, Archive } from 'lucide-react';
import { Idea } from '@/lib/types';
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
import { format } from 'date-fns';

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const { 
    currentProfile, 
    convertIdeaToProject, 
    convertIdeaToTask, 
    archiveIdea, 
    deleteIdea 
  } = useApp();

  const area = idea.areaId 
    ? currentProfile.areas.find(a => a.id === idea.areaId)
    : null;

  return (
    <div className={cn(
      'group relative bg-card rounded-lg border border-border p-4 transition-all duration-200',
      'hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/5'
    )}>
      {/* Icon */}
      <div className="absolute -top-3 -left-2">
        <div className="h-8 w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-yellow-400" />
        </div>
      </div>

      {/* Content */}
      <div className="pt-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground">{idea.title}</h4>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => convertIdeaToProject(idea.id)}>
                <FolderKanban className="h-4 w-4 mr-2" />
                Make Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => convertIdeaToTask(idea.id)}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Make Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => archiveIdea(idea.id)}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteIdea(idea.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {idea.notes && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {idea.notes}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mt-3">
          {area && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {area.name}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {format(new Date(idea.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
}

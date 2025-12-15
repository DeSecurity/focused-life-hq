import { useMemo, useState } from 'react';
import { FolderKanban, Plus, Search, LayoutGrid, List, Archive } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectStatus } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProjectsView() {
  const { currentProfile, setQuickAddOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const projects = useMemo(() => {
    return currentProfile.projects
      .filter(project => {
        if (showArchived !== (project.archived || false)) return false;
        if (statusFilter !== 'all' && project.status !== statusFilter) return false;
        if (areaFilter !== 'all' && project.areaId !== areaFilter) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            project.title.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Focus projects first, then by updated date
        if (a.isFocus && !b.isFocus) return -1;
        if (!a.isFocus && b.isFocus) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [currentProfile.projects, searchQuery, statusFilter, areaFilter, showArchived]);

  const activeCount = currentProfile.projects.filter(p => !p.archived).length;
  const archivedCount = currentProfile.projects.filter(p => p.archived).length;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center glow-sm">
            <FolderKanban className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">Manage your projects and goals</p>
          </div>
        </div>
        <Button onClick={() => setQuickAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as ProjectStatus | 'all')}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {currentProfile.areas.map(area => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={!showArchived ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(false)}
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={showArchived ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(true)}
          >
            <Archive className="h-4 w-4 mr-1" />
            ({archivedCount})
          </Button>
        </div>

        <div className="flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-secondary' : 'hover:bg-muted'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-secondary' : 'hover:bg-muted'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {projects.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-3'
        }>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <FolderKanban className="h-16 w-16 text-purple-500/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' || areaFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first project to get started'}
          </p>
          {!searchQuery && statusFilter === 'all' && areaFilter === 'all' && (
            <Button onClick={() => setQuickAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

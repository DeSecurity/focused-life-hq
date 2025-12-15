import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TaskCard } from '@/components/shared/TaskCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ProjectStatus, Priority } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

const statusColors: Record<ProjectStatus, string> = {
  backlog: 'bg-status-backlog/20 text-status-backlog',
  active: 'bg-status-inprogress/20 text-status-inprogress',
  'on-hold': 'bg-status-blocked/20 text-status-blocked',
  completed: 'bg-status-done/20 text-status-done',
  cancelled: 'bg-muted text-muted-foreground',
};

export function ProjectDetailView() {
  const { 
    currentProfile, 
    selectedProjectId, 
    setCurrentView, 
    setSelectedProjectId,
    createTask,
    updateProject,
    deleteProject,
  } = useApp();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const project = currentProfile.projects.find(p => p.id === selectedProjectId);
  
  const tasks = useMemo(() => {
    if (!project) return [];
    return currentProfile.tasks
      .filter(t => t.projectId === project.id)
      .sort((a, b) => {
        // Sort by status, then priority
        const statusOrder = { 'in-progress': 0, 'todo': 1, 'backlog': 2, 'blocked': 3, 'done': 4 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [project, currentProfile.tasks]);

  const area = project ? currentProfile.areas.find(a => a.id === project.areaId) : null;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="ghost" onClick={() => setCurrentView('projects')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    createTask({
      projectId: project.id,
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
      tags: [],
    });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    setCurrentView('projects');
    setSelectedProjectId(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => {
          setCurrentView('projects');
          setSelectedProjectId(null);
        }}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
              <Badge variant="secondary" className={statusColors[project.status]}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
              </Badge>
            </div>
            {area && (
              <p className="text-muted-foreground mb-3">{area.name}</p>
            )}
            {project.description && (
              <p className="text-foreground">{project.description}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <Select 
              value={project.status} 
              onValueChange={v => updateProject(project.id, { status: v as ProjectStatus })}
            >
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Priority:</span>
            <Select 
              value={project.priority} 
              onValueChange={v => updateProject(project.id, { priority: v as Priority })}
            >
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {project.dueDate && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Due:</span>
              <span className="text-foreground">{format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground">{completedTasks}/{tasks.length} tasks</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Tasks Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
          <Button size="sm" onClick={() => setShowAddTask(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <div className="bg-card rounded-lg border border-border p-4 mb-4 animate-fade-in">
            <div className="flex gap-2">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                autoFocus
                className="bg-surface-2 border-border"
              />
              <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>Add</Button>
              <Button variant="ghost" onClick={() => setShowAddTask(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Task List */}
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} showProject={false} isDraggable={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground mb-4">No tasks yet</p>
            <Button onClick={() => setShowAddTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Task
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

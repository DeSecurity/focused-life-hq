import { useMemo, useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CheckSquare, Filter } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from '@/components/shared/TaskCard';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'bg-status-backlog' },
  { id: 'todo', label: 'To Do', color: 'bg-status-todo' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-status-inprogress' },
  { id: 'blocked', label: 'Blocked', color: 'bg-status-blocked' },
  { id: 'done', label: 'Done', color: 'bg-status-done' },
];

export function BoardView() {
  const { currentProfile, updateTaskStatus } = useApp();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredTasks = useMemo(() => {
    return currentProfile.tasks.filter(task => {
      if (projectFilter !== 'all' && task.projectId !== projectFilter) return false;
      if (areaFilter !== 'all') {
        const taskArea = task.areaId || currentProfile.projects.find(p => p.id === task.projectId)?.areaId;
        if (taskArea !== areaFilter) return false;
      }
      return true;
    });
  }, [currentProfile.tasks, currentProfile.projects, projectFilter, areaFilter]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      'in-progress': [],
      blocked: [],
      done: [],
    };
    
    filteredTasks.forEach(task => {
      grouped[task.status].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = currentProfile.tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (over && active.id !== over.id) {
      // Check if dropped on a column
      const newStatus = COLUMNS.find(c => c.id === over.id)?.id;
      if (newStatus) {
        updateTaskStatus(active.id as string, newStatus);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Board</h1>
              <p className="text-sm text-muted-foreground">{filteredTasks.length} tasks</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px] bg-card border-border">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {currentProfile.projects.filter(p => !p.archived).map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-[150px] bg-card border-border">
                <SelectValue placeholder="All Areas" />
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
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(column => (
              <div
                key={column.id}
                className="w-80 flex flex-col bg-surface-1 rounded-xl border border-border"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-2 w-2 rounded-full', column.color)} />
                    <h3 className="font-semibold text-foreground">{column.label}</h3>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {tasksByStatus[column.id].length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2">
                  <SortableContext
                    items={tasksByStatus[column.id].map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasksByStatus[column.id].map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </SortableContext>

                  {/* Drop Zone */}
                  <div
                    data-droppable={column.id}
                    className={cn(
                      'min-h-[60px] rounded-lg border-2 border-dashed border-transparent transition-colors',
                      tasksByStatus[column.id].length === 0 && 'border-border'
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} isDraggable={false} />}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

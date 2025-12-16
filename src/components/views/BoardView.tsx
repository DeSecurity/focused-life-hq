import React, { useMemo, useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  rectIntersection,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
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

// Column Droppable Component
function ColumnDroppable({ 
  column, 
  tasks, 
  children 
}: { 
  column: typeof COLUMNS[0]; 
  tasks: Task[];
  children: React.ReactNode;
}) {
  const { setNodeRef: setColumnRef, isOver: isColumnOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      status: column.id,
    },
  });

  return (
    <div
      ref={setColumnRef}
      className={cn(
        'w-80 flex flex-col bg-surface-1 rounded-xl border border-border transition-colors',
        isColumnOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {children}
    </div>
  );
}

// Column Content Droppable - for detecting drops in the content area
function ColumnContentDroppable({ 
  columnId, 
  children 
}: { 
  columnId: TaskStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-content-${columnId}`,
    data: {
      type: 'column',
      status: columnId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 p-3 overflow-y-auto space-y-2 min-h-[200px] relative',
        isOver && 'bg-primary/5 ring-2 ring-primary/20'
      )}
    >
      {children}
    </div>
  );
}

export function BoardView() {
  const { currentProfile, updateTaskStatus, updateTask } = useApp();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [overId, setOverId] = useState<string | null>(null);

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

    // Sort each group by order (lower order = higher in list), then by creation date
    Object.keys(grouped).forEach(status => {
      grouped[status as TaskStatus].sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = currentProfile.tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
    setOverId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setOverId(over.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = currentProfile.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Debug logging
    console.log('Drag end:', { 
      taskId, 
      taskStatus: task.status, 
      overId: over.id, 
      overIdType: typeof over.id 
    });

    // Check if dropped on another task
    const overTask = currentProfile.tasks.find(t => t.id === over.id);
    
    if (overTask) {
      // Dropped on a task
      console.log('Dropped on task:', { 
        overTaskId: overTask.id, 
        overTaskStatus: overTask.status,
        taskStatus: task.status 
      });
      
      if (overTask.status !== task.status) {
        // Dropped on a task in a different column - move to that column
        console.log('Moving to different column:', overTask.status);
        updateTaskStatus(taskId, overTask.status);
        // Set order based on position relative to the task it was dropped on
        const tasksInNewStatus = tasksByStatus[overTask.status];
        const overIndex = tasksInNewStatus.findIndex(t => t.id === overTask.id);
        const newOrder = overTask.order ?? overIndex;
        updateTask(taskId, { order: newOrder });
        return;
      } else {
        // Reordering within the same column
        const tasksInStatus = [...tasksByStatus[task.status]]; // Create a copy
        const oldIndex = tasksInStatus.findIndex(t => t.id === taskId);
        const newIndex = tasksInStatus.findIndex(t => t.id === overTask.id);

        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
          // Reorder the tasks array
          const reorderedTasks = arrayMove(tasksInStatus, oldIndex, newIndex);
          
          // Update order for all tasks in the affected range to ensure consistency
          const startIndex = Math.min(oldIndex, newIndex);
          const endIndex = Math.max(oldIndex, newIndex);
          
          // Update all tasks in the affected range
          for (let i = startIndex; i <= endIndex; i++) {
            const taskToUpdate = reorderedTasks[i];
            if (taskToUpdate && taskToUpdate.order !== i) {
              updateTask(taskToUpdate.id, { order: i });
            }
          }
        }
        return;
      }
    }

    // Check if dropped on a column (format: "column-{status}" or "column-content-{status}") - empty area
    if (typeof over.id === 'string') {
      let newStatus: TaskStatus | null = null;
      
      // Try to get status from droppable data first
      if (over.data?.current) {
        const droppableData = over.data.current as { type?: string; status?: TaskStatus };
        if (droppableData.type === 'column' && droppableData.status) {
          newStatus = droppableData.status;
          console.log('Got status from droppable data:', newStatus);
        }
      }
      
      // Fallback to parsing ID
      if (!newStatus) {
        if (over.id.startsWith('column-content-')) {
          newStatus = over.id.replace('column-content-', '') as TaskStatus;
          console.log('Dropped on column content:', newStatus);
        } else if (over.id.startsWith('column-') && !over.id.includes('content')) {
          newStatus = over.id.replace('column-', '') as TaskStatus;
          console.log('Dropped on column:', newStatus);
        }
      }
      
      if (newStatus && COLUMNS.some(c => c.id === newStatus) && newStatus !== task.status) {
        console.log('Moving to column:', newStatus);
        // Moving to different column - update status and set order to end
        updateTaskStatus(taskId, newStatus);
        // Set order to be at the end of the new column
        const tasksInNewStatus = tasksByStatus[newStatus];
        const maxOrder = tasksInNewStatus.length > 0 
          ? Math.max(...tasksInNewStatus.map(t => t.order ?? 0), -1) + 1
          : 0;
        updateTask(taskId, { order: maxOrder });
      } else {
        console.log('No valid column drop detected', { newStatus, taskStatus: task.status });
      }
    } else {
      console.log('Over ID is not a string:', over.id, 'Type:', typeof over.id);
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
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(column => (
              <ColumnDroppable
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id]}
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
                <ColumnContentDroppable columnId={column.id}>
                  <SortableContext
                    items={tasksByStatus[column.id].map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasksByStatus[column.id].map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </SortableContext>

                  {/* Empty Drop Zone */}
                  {tasksByStatus[column.id].length === 0 && (
                    <div className="min-h-[60px] rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Drop tasks here</span>
                    </div>
                  )}
                </ColumnContentDroppable>
              </ColumnDroppable>
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

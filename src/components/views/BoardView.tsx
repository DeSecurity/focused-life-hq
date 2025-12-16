import React, { useMemo, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
  const { currentProfile, updateTaskStatus, updateTask } = useApp();
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  // Local optimistic state for tasks
  const [localTasks, setLocalTasks] = useState<Task[]>(currentProfile.tasks);
  const lastTaskCountRef = React.useRef(currentProfile.tasks.length);

  // Sync local tasks with context when tasks are added/removed (not reordered)
  useEffect(() => {
    const currentTaskCount = currentProfile.tasks.length;
    
    // If task count changed, sync (task was added or deleted)
    if (currentTaskCount !== lastTaskCountRef.current) {
      setLocalTasks(currentProfile.tasks);
      lastTaskCountRef.current = currentTaskCount;
      return;
    }

    // Check if any task IDs are missing (task was deleted)
    const localTaskIds = new Set(localTasks.map(t => t.id));
    const contextTaskIds = new Set(currentProfile.tasks.map(t => t.id));
    const hasMissingTasks = Array.from(localTaskIds).some(id => !contextTaskIds.has(id));
    const hasNewTasks = Array.from(contextTaskIds).some(id => !localTaskIds.has(id));

    if (hasMissingTasks || hasNewTasks) {
      setLocalTasks(currentProfile.tasks);
      lastTaskCountRef.current = currentTaskCount;
    }
  }, [currentProfile.tasks, localTasks]);

  const filteredTasks = useMemo(() => {
    return localTasks.filter(task => {
      if (projectFilter !== 'all' && task.projectId !== projectFilter) return false;
      if (areaFilter !== 'all') {
        const taskArea = task.areaId || currentProfile.projects.find(p => p.id === task.projectId)?.areaId;
        if (taskArea !== areaFilter) return false;
      }
      return true;
    });
  }, [localTasks, currentProfile.projects, projectFilter, areaFilter]);

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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area, do nothing
    if (!destination) {
      return;
    }

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const task = localTasks.find(t => t.id === taskId);
    if (!task) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destinationStatus = destination.droppableId as TaskStatus;

    // Validate statuses
    if (!COLUMNS.some(c => c.id === sourceStatus) || !COLUMNS.some(c => c.id === destinationStatus)) {
      return;
    }

    // Create updated tasks array optimistically
    const updatedTasks = [...localTasks];
    const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return;

    // Handle cross-column move
    if (sourceStatus !== destinationStatus) {
      // Update the task's status and order
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        status: destinationStatus,
        order: destination.index,
        updatedAt: new Date().toISOString(),
      };

      // Update orders for tasks in destination column that need to shift down
      const tasksInDestination = updatedTasks.filter(
        t => t.status === destinationStatus && t.id !== taskId
      );
      tasksInDestination.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      for (let i = destination.index; i < tasksInDestination.length; i++) {
        const shiftedTask = tasksInDestination[i];
        const shiftedIndex = updatedTasks.findIndex(t => t.id === shiftedTask.id);
        if (shiftedIndex !== -1) {
          updatedTasks[shiftedIndex] = {
            ...updatedTasks[shiftedIndex],
            order: i + 1,
            updatedAt: new Date().toISOString(),
          };
        }
      }

      // Update orders for tasks in source column that need to shift up
      const tasksInSource = updatedTasks.filter(
        t => t.status === sourceStatus && t.id !== taskId
      );
      tasksInSource.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      for (let i = source.index; i < tasksInSource.length; i++) {
        const shiftedTask = tasksInSource[i];
        const shiftedIndex = updatedTasks.findIndex(t => t.id === shiftedTask.id);
        if (shiftedIndex !== -1) {
          updatedTasks[shiftedIndex] = {
            ...updatedTasks[shiftedIndex],
            order: i,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    } else {
      // Handle reordering within same column
      const tasksInStatus = updatedTasks
        .filter(t => t.status === sourceStatus)
        .sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

      const oldIndex = source.index;
      const newIndex = destination.index;

      // Reorder the array
      const [movedTask] = tasksInStatus.splice(oldIndex, 1);
      tasksInStatus.splice(newIndex, 0, movedTask);

      // Update orders for all tasks in the column
      tasksInStatus.forEach((t, index) => {
        const taskIndex = updatedTasks.findIndex(task => task.id === t.id);
        if (taskIndex !== -1 && updatedTasks[taskIndex].order !== index) {
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            order: index,
            updatedAt: new Date().toISOString(),
          };
        }
      });
    }

    // Optimistically update local state immediately
    setLocalTasks(updatedTasks);

    // Then persist changes to context (async) - batch updates
    updatedTasks.forEach(updatedTask => {
      const originalTask = currentProfile.tasks.find(t => t.id === updatedTask.id);
      if (originalTask) {
        // If status changed, use updateTaskStatus (which also updates order if needed)
        if (originalTask.status !== updatedTask.status) {
          updateTaskStatus(updatedTask.id, updatedTask.status);
          // Also update order if it changed
          if (originalTask.order !== updatedTask.order) {
            updateTask(updatedTask.id, { order: updatedTask.order });
          }
        } else if (originalTask.order !== updatedTask.order) {
          // Only order changed, just update order
          updateTask(updatedTask.id, { order: updatedTask.order });
        }
      }
    });
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(column => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'w-80 flex flex-col bg-surface-1 rounded-xl border border-border transition-colors',
                      snapshot.isDraggingOver && 'ring-2 ring-primary ring-offset-2'
                    )}
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
                    <div className={cn(
                      'flex-1 p-3 overflow-y-auto space-y-2 min-h-[200px] relative',
                      snapshot.isDraggingOver && 'bg-primary/5'
                    )}>
                      {tasksByStatus[column.id].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                snapshot.isDragging && 'opacity-50'
                              )}
                            >
                              <TaskCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Empty state indicator */}
                      {tasksByStatus[column.id].length === 0 && (
                        <div className="min-h-[60px] rounded-lg border-2 border-dashed border-border flex items-center justify-center mt-2">
                          <span className="text-sm text-muted-foreground">Drop tasks here</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

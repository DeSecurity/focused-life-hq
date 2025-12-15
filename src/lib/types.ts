/**
 * Core type definitions for the Life PM application
 * All data is stored in localStorage and managed client-side
 */

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectStatus = 'backlog' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'blocked' | 'done';
export type GoalType = 'habit' | 'one-time' | 'milestone';

export interface ChecklistItem {
  id: string;
  content: string;
  done: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface Idea {
  id: string;
  title: string;
  notes?: string;
  areaId?: string;
  tags: string[];
  createdAt: string;
  archived?: boolean;
}

export interface Task {
  id: string;
  projectId?: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  tags: string[];
  areaId?: string;
  estimateMinutes?: number;
  timeSpentMinutes?: number;
  dueDate?: string;
  isToday?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  checklistItems: ChecklistItem[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  status: ProjectStatus;
  priority: Priority;
  tags: string[];
  startDate?: string;
  dueDate?: string;
  goalType?: GoalType;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  isFocus?: boolean;
}

export interface ProfileSettings {
  theme: 'dark' | 'light';
  defaultView: 'today' | 'board' | 'projects' | 'ideas';
  defaultTaskGrouping: 'project' | 'area' | 'dueDate';
  hideCompletedTasks: boolean;
}

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
  areas: Area[];
  projects: Project[];
  tasks: Task[];
  ideas: Idea[];
  tags: Tag[];
  settings: ProfileSettings;
}

export interface AppData {
  profiles: Profile[];
  currentProfileId: string;
  version: string;
}

// View types for navigation
export type ViewType = 
  | 'today' 
  | 'this-week' 
  | 'ideas' 
  | 'projects' 
  | 'board' 
  | 'areas' 
  | 'completed' 
  | 'settings'
  | 'project-detail'
  | 'backlog';

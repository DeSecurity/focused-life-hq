/**
 * Global application state context
 * Manages all data and provides actions for CRUD operations
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  AppData, 
  Profile, 
  Project, 
  Task, 
  Idea, 
  Area, 
  Tag, 
  ViewType,
  TaskStatus,
  ProjectStatus,
  Priority,
} from '@/lib/types';
import { initializeData, saveData, setCurrentProfileId, resetData } from '@/lib/storage';

interface AppContextType {
  // Data
  data: AppData;
  currentProfile: Profile;
  
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  
  // Profile actions
  switchProfile: (profileId: string) => void;
  createProfile: (name: string) => void;
  renameProfile: (profileId: string, name: string) => void;
  deleteProfile: (profileId: string) => void;
  
  // Area actions
  createArea: (area: Omit<Area, 'id'>) => void;
  updateArea: (id: string, updates: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  
  // Project actions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  
  // Task actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'checklistItems'> & { checklistItems?: Task['checklistItems'] }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  toggleTaskToday: (id: string) => void;
  
  // Idea actions
  createIdea: (idea: Omit<Idea, 'id' | 'createdAt'>) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  convertIdeaToProject: (ideaId: string) => void;
  convertIdeaToTask: (ideaId: string, projectId?: string) => void;
  archiveIdea: (id: string) => void;
  
  // Tag actions
  createTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<Profile['settings']>) => void;
  
  // Data management
  resetAllData: () => void;
  
  // Quick add
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  
  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => initializeData());
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Get current profile
  const currentProfile = data.profiles.find(p => p.id === data.currentProfileId) || data.profiles[0];
  
  // Persist data on changes
  const persistData = useCallback((newData: AppData) => {
    setData(newData);
    saveData(newData);
  }, []);
  
  // Update current profile helper
  const updateCurrentProfile = useCallback((updates: Partial<Profile>) => {
    const newProfiles = data.profiles.map(p => 
      p.id === currentProfile.id ? { ...p, ...updates } : p
    );
    persistData({ ...data, profiles: newProfiles });
  }, [data, currentProfile.id, persistData]);
  
  // Profile actions
  const switchProfile = useCallback((profileId: string) => {
    if (data.profiles.some(p => p.id === profileId)) {
      setCurrentProfileId(profileId);
      persistData({ ...data, currentProfileId: profileId });
    }
  }, [data, persistData]);
  
  const createProfile = useCallback((name: string) => {
    const newProfile: Profile = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString(),
      areas: [],
      projects: [],
      tasks: [],
      ideas: [],
      tags: [],
      settings: {
        theme: 'dark',
        defaultView: 'today',
        defaultTaskGrouping: 'project',
        hideCompletedTasks: false,
      },
    };
    persistData({ ...data, profiles: [...data.profiles, newProfile] });
  }, [data, persistData]);
  
  const renameProfile = useCallback((profileId: string, name: string) => {
    const newProfiles = data.profiles.map(p => 
      p.id === profileId ? { ...p, name } : p
    );
    persistData({ ...data, profiles: newProfiles });
  }, [data, persistData]);
  
  const deleteProfile = useCallback((profileId: string) => {
    if (data.profiles.length <= 1) return;
    const newProfiles = data.profiles.filter(p => p.id !== profileId);
    const newCurrentId = data.currentProfileId === profileId 
      ? newProfiles[0].id 
      : data.currentProfileId;
    setCurrentProfileId(newCurrentId);
    persistData({ ...data, profiles: newProfiles, currentProfileId: newCurrentId });
  }, [data, persistData]);
  
  // Area actions
  const createArea = useCallback((area: Omit<Area, 'id'>) => {
    const newArea: Area = { ...area, id: uuidv4() };
    updateCurrentProfile({ areas: [...currentProfile.areas, newArea] });
  }, [currentProfile.areas, updateCurrentProfile]);
  
  const updateArea = useCallback((id: string, updates: Partial<Area>) => {
    const newAreas = currentProfile.areas.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    updateCurrentProfile({ areas: newAreas });
  }, [currentProfile.areas, updateCurrentProfile]);
  
  const deleteArea = useCallback((id: string) => {
    updateCurrentProfile({ areas: currentProfile.areas.filter(a => a.id !== id) });
  }, [currentProfile.areas, updateCurrentProfile]);
  
  // Project actions
  const createProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    updateCurrentProfile({ projects: [...currentProfile.projects, newProject] });
  }, [currentProfile.projects, updateCurrentProfile]);
  
  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const newProjects = currentProfile.projects.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    updateCurrentProfile({ projects: newProjects });
  }, [currentProfile.projects, updateCurrentProfile]);
  
  const deleteProject = useCallback((id: string) => {
    // Also delete associated tasks
    const newTasks = currentProfile.tasks.filter(t => t.projectId !== id);
    updateCurrentProfile({ 
      projects: currentProfile.projects.filter(p => p.id !== id),
      tasks: newTasks,
    });
  }, [currentProfile.projects, currentProfile.tasks, updateCurrentProfile]);
  
  const archiveProject = useCallback((id: string) => {
    updateProject(id, { archived: true, status: 'completed' });
  }, [updateProject]);
  
  // Task actions
  const createTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'checklistItems'> & { checklistItems?: Task['checklistItems'] }) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      checklistItems: task.checklistItems || [],
    };
    updateCurrentProfile({ tasks: [...currentProfile.tasks, newTask] });
  }, [currentProfile.tasks, updateCurrentProfile]);
  
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const newTasks = currentProfile.tasks.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
        // Set completedAt when task is done
        if (updates.status === 'done' && t.status !== 'done') {
          updated.completedAt = new Date().toISOString();
        }
        return updated;
      }
      return t;
    });
    updateCurrentProfile({ tasks: newTasks });
  }, [currentProfile.tasks, updateCurrentProfile]);
  
  const deleteTask = useCallback((id: string) => {
    updateCurrentProfile({ tasks: currentProfile.tasks.filter(t => t.id !== id) });
  }, [currentProfile.tasks, updateCurrentProfile]);
  
  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    updateTask(id, { status });
  }, [updateTask]);
  
  const toggleTaskToday = useCallback((id: string) => {
    const task = currentProfile.tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { isToday: !task.isToday });
    }
  }, [currentProfile.tasks, updateTask]);
  
  // Idea actions
  const createIdea = useCallback((idea: Omit<Idea, 'id' | 'createdAt'>) => {
    const newIdea: Idea = {
      ...idea,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    updateCurrentProfile({ ideas: [...currentProfile.ideas, newIdea] });
  }, [currentProfile.ideas, updateCurrentProfile]);
  
  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    const newIdeas = currentProfile.ideas.map(i => 
      i.id === id ? { ...i, ...updates } : i
    );
    updateCurrentProfile({ ideas: newIdeas });
  }, [currentProfile.ideas, updateCurrentProfile]);
  
  const deleteIdea = useCallback((id: string) => {
    updateCurrentProfile({ ideas: currentProfile.ideas.filter(i => i.id !== id) });
  }, [currentProfile.ideas, updateCurrentProfile]);
  
  const convertIdeaToProject = useCallback((ideaId: string) => {
    const idea = currentProfile.ideas.find(i => i.id === ideaId);
    if (!idea) return;
    
    const now = new Date().toISOString();
    const newProject: Project = {
      id: uuidv4(),
      title: idea.title,
      description: idea.notes,
      areaId: idea.areaId || currentProfile.areas[0]?.id || '',
      status: 'backlog',
      priority: 'medium',
      tags: idea.tags,
      createdAt: now,
      updatedAt: now,
    };
    
    updateCurrentProfile({ 
      projects: [...currentProfile.projects, newProject],
      ideas: currentProfile.ideas.filter(i => i.id !== ideaId),
    });
  }, [currentProfile.ideas, currentProfile.projects, currentProfile.areas, updateCurrentProfile]);
  
  const convertIdeaToTask = useCallback((ideaId: string, projectId?: string) => {
    const idea = currentProfile.ideas.find(i => i.id === ideaId);
    if (!idea) return;
    
    const now = new Date().toISOString();
    const newTask: Task = {
      id: uuidv4(),
      projectId,
      title: idea.title,
      description: idea.notes,
      status: 'todo',
      priority: 'medium',
      tags: idea.tags,
      areaId: idea.areaId,
      createdAt: now,
      updatedAt: now,
      checklistItems: [],
    };
    
    updateCurrentProfile({ 
      tasks: [...currentProfile.tasks, newTask],
      ideas: currentProfile.ideas.filter(i => i.id !== ideaId),
    });
  }, [currentProfile.ideas, currentProfile.tasks, updateCurrentProfile]);
  
  const archiveIdea = useCallback((id: string) => {
    updateIdea(id, { archived: true });
  }, [updateIdea]);
  
  // Tag actions
  const createTag = useCallback((tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = { ...tag, id: uuidv4() };
    updateCurrentProfile({ tags: [...currentProfile.tags, newTag] });
  }, [currentProfile.tags, updateCurrentProfile]);
  
  const updateTag = useCallback((id: string, updates: Partial<Tag>) => {
    const newTags = currentProfile.tags.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    updateCurrentProfile({ tags: newTags });
  }, [currentProfile.tags, updateCurrentProfile]);
  
  const deleteTag = useCallback((id: string) => {
    // Remove tag from all entities
    const newProjects = currentProfile.projects.map(p => ({
      ...p,
      tags: p.tags.filter(t => t !== id),
    }));
    const newTasks = currentProfile.tasks.map(t => ({
      ...t,
      tags: t.tags.filter(tag => tag !== id),
    }));
    const newIdeas = currentProfile.ideas.map(i => ({
      ...i,
      tags: i.tags.filter(t => t !== id),
    }));
    
    updateCurrentProfile({ 
      tags: currentProfile.tags.filter(t => t.id !== id),
      projects: newProjects,
      tasks: newTasks,
      ideas: newIdeas,
    });
  }, [currentProfile.tags, currentProfile.projects, currentProfile.tasks, currentProfile.ideas, updateCurrentProfile]);
  
  // Settings
  const updateSettings = useCallback((settings: Partial<Profile['settings']>) => {
    updateCurrentProfile({ settings: { ...currentProfile.settings, ...settings } });
  }, [currentProfile.settings, updateCurrentProfile]);
  
  // Reset
  const resetAllData = useCallback(() => {
    const newData = resetData();
    setData(newData);
  }, []);
  
  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(currentProfile.settings.theme);
  }, [currentProfile.settings.theme]);
  
  const value: AppContextType = {
    data,
    currentProfile,
    currentView,
    setCurrentView,
    selectedProjectId,
    setSelectedProjectId,
    switchProfile,
    createProfile,
    renameProfile,
    deleteProfile,
    createArea,
    updateArea,
    deleteArea,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    toggleTaskToday,
    createIdea,
    updateIdea,
    deleteIdea,
    convertIdeaToProject,
    convertIdeaToTask,
    archiveIdea,
    createTag,
    updateTag,
    deleteTag,
    updateSettings,
    resetAllData,
    quickAddOpen,
    setQuickAddOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

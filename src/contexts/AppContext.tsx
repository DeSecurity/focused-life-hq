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
import { initializeData, saveData, setCurrentProfileId, resetData } from '@/lib/supabaseStorage';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Data
  data: AppData | null;
  currentProfile: Profile | null;
  dataLoading: boolean;
  
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
  const { user } = useAuth();
  const [data, setData] = useState<AppData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Load data when user changes
  useEffect(() => {
    if (user) {
      setDataLoading(true);
      console.log('📥 Loading data for user:', user.id);
      initializeData(user.id)
        .then((loadedData) => {
          console.log('✅ Data loaded successfully:', { 
            profiles: loadedData.profiles.length,
            currentProfile: loadedData.currentProfileId 
          });
          setData(loadedData);
          setDataLoading(false);
        })
        .catch((error) => {
          console.error('❌ Failed to load data:', error);
          // Even if loading fails, try to initialize with default data
          initializeData(user.id)
            .then((defaultData) => {
              console.log('✅ Initialized with default data');
              setData(defaultData);
              setDataLoading(false);
            })
            .catch((initError) => {
              console.error('❌ Failed to initialize data:', initError);
              setDataLoading(false);
              setData(null);
            });
        });
    } else {
      setData(null);
      setDataLoading(false);
    }
  }, [user]);
  
  // Get current profile
  const currentProfile = data?.profiles.find(p => p.id === data.currentProfileId) || data?.profiles[0];
  
  // Persist data on changes
  const persistData = useCallback(async (newData: AppData) => {
    if (!user) return;
    setData(newData);
    await saveData(user.id, newData);
  }, [user]);
  
  // Update current profile helper
  const updateCurrentProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!data || !currentProfile) return;
    const newProfiles = data.profiles.map(p => 
      p.id === currentProfile.id ? { ...p, ...updates } : p
    );
    await persistData({ ...data, profiles: newProfiles });
  }, [data, currentProfile, persistData]);
  
  // Profile actions
  const switchProfile = useCallback(async (profileId: string) => {
    if (!data || !user) return;
    if (data.profiles.some(p => p.id === profileId)) {
      await setCurrentProfileId(user.id, profileId);
      persistData({ ...data, currentProfileId: profileId });
    }
  }, [data, user, persistData]);
  
  const createProfile = useCallback(async (name: string) => {
    if (!data) return;
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
    await persistData({ ...data, profiles: [...data.profiles, newProfile] });
  }, [data, persistData]);
  
  const renameProfile = useCallback(async (profileId: string, name: string) => {
    if (!data) return;
    const newProfiles = data.profiles.map(p => 
      p.id === profileId ? { ...p, name } : p
    );
    await persistData({ ...data, profiles: newProfiles });
  }, [data, persistData]);
  
  const deleteProfile = useCallback(async (profileId: string) => {
    if (!data || !user || data.profiles.length <= 1) return;
    const newProfiles = data.profiles.filter(p => p.id !== profileId);
    const newCurrentId = data.currentProfileId === profileId 
      ? newProfiles[0].id 
      : data.currentProfileId;
    await setCurrentProfileId(user.id, newCurrentId);
    await persistData({ ...data, profiles: newProfiles, currentProfileId: newCurrentId });
  }, [data, user, persistData]);
  
  // Area actions
  const createArea = useCallback(async (area: Omit<Area, 'id'>) => {
    if (!currentProfile) return;
    const newArea: Area = { ...area, id: uuidv4() };
    await updateCurrentProfile({ areas: [...currentProfile.areas, newArea] });
  }, [currentProfile, updateCurrentProfile]);
  
  const updateArea = useCallback(async (id: string, updates: Partial<Area>) => {
    if (!currentProfile) return;
    const newAreas = currentProfile.areas.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    await updateCurrentProfile({ areas: newAreas });
  }, [currentProfile, updateCurrentProfile]);
  
  const deleteArea = useCallback(async (id: string) => {
    if (!currentProfile) return;
    await updateCurrentProfile({ areas: currentProfile.areas.filter(a => a.id !== id) });
  }, [currentProfile, updateCurrentProfile]);
  
  // Project actions
  const createProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentProfile) return;
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await updateCurrentProfile({ projects: [...currentProfile.projects, newProject] });
  }, [currentProfile, updateCurrentProfile]);
  
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    if (!currentProfile) return;
    const newProjects = currentProfile.projects.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    await updateCurrentProfile({ projects: newProjects });
  }, [currentProfile, updateCurrentProfile]);
  
  const deleteProject = useCallback(async (id: string) => {
    if (!currentProfile) return;
    // Also delete associated tasks
    const newTasks = currentProfile.tasks.filter(t => t.projectId !== id);
    await updateCurrentProfile({ 
      projects: currentProfile.projects.filter(p => p.id !== id),
      tasks: newTasks,
    });
  }, [currentProfile, updateCurrentProfile]);
  
  const archiveProject = useCallback(async (id: string) => {
    await updateProject(id, { archived: true, status: 'completed' });
  }, [updateProject]);
  
  // Task actions
  const createTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'checklistItems'> & { checklistItems?: Task['checklistItems'] }) => {
    if (!currentProfile) return;
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      checklistItems: task.checklistItems || [],
    };
    await updateCurrentProfile({ tasks: [...currentProfile.tasks, newTask] });
  }, [currentProfile, updateCurrentProfile]);
  
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!currentProfile) return;
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
    await updateCurrentProfile({ tasks: newTasks });
  }, [currentProfile, updateCurrentProfile]);
  
  const deleteTask = useCallback(async (id: string) => {
    if (!currentProfile) return;
    await updateCurrentProfile({ tasks: currentProfile.tasks.filter(t => t.id !== id) });
  }, [currentProfile, updateCurrentProfile]);
  
  const updateTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  }, [updateTask]);
  
  const toggleTaskToday = useCallback(async (id: string) => {
    if (!currentProfile) return;
    const task = currentProfile.tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { isToday: !task.isToday });
    }
  }, [currentProfile, updateTask]);
  
  // Idea actions
  const createIdea = useCallback(async (idea: Omit<Idea, 'id' | 'createdAt'>) => {
    if (!currentProfile) return;
    const newIdea: Idea = {
      ...idea,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    await updateCurrentProfile({ ideas: [...currentProfile.ideas, newIdea] });
  }, [currentProfile, updateCurrentProfile]);
  
  const updateIdea = useCallback(async (id: string, updates: Partial<Idea>) => {
    if (!currentProfile) return;
    const newIdeas = currentProfile.ideas.map(i => 
      i.id === id ? { ...i, ...updates } : i
    );
    await updateCurrentProfile({ ideas: newIdeas });
  }, [currentProfile, updateCurrentProfile]);
  
  const deleteIdea = useCallback(async (id: string) => {
    if (!currentProfile) return;
    await updateCurrentProfile({ ideas: currentProfile.ideas.filter(i => i.id !== id) });
  }, [currentProfile, updateCurrentProfile]);
  
  const convertIdeaToProject = useCallback(async (ideaId: string) => {
    if (!currentProfile) return;
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
    
    await updateCurrentProfile({ 
      projects: [...currentProfile.projects, newProject],
      ideas: currentProfile.ideas.filter(i => i.id !== ideaId),
    });
  }, [currentProfile, updateCurrentProfile]);
  
  const convertIdeaToTask = useCallback(async (ideaId: string, projectId?: string) => {
    if (!currentProfile) return;
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
    
    await updateCurrentProfile({ 
      tasks: [...currentProfile.tasks, newTask],
      ideas: currentProfile.ideas.filter(i => i.id !== ideaId),
    });
  }, [currentProfile, updateCurrentProfile]);
  
  const archiveIdea = useCallback(async (id: string) => {
    await updateIdea(id, { archived: true });
  }, [updateIdea]);
  
  // Tag actions
  const createTag = useCallback(async (tag: Omit<Tag, 'id'>) => {
    if (!currentProfile) return;
    const newTag: Tag = { ...tag, id: uuidv4() };
    await updateCurrentProfile({ tags: [...currentProfile.tags, newTag] });
  }, [currentProfile, updateCurrentProfile]);
  
  const updateTag = useCallback(async (id: string, updates: Partial<Tag>) => {
    if (!currentProfile) return;
    const newTags = currentProfile.tags.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    await updateCurrentProfile({ tags: newTags });
  }, [currentProfile, updateCurrentProfile]);
  
  const deleteTag = useCallback(async (id: string) => {
    if (!currentProfile) return;
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
    
    await updateCurrentProfile({ 
      tags: currentProfile.tags.filter(t => t.id !== id),
      projects: newProjects,
      tasks: newTasks,
      ideas: newIdeas,
    });
  }, [currentProfile, updateCurrentProfile]);
  
  // Settings
  const updateSettings = useCallback(async (settings: Partial<Profile['settings']>) => {
    if (!currentProfile) return;
    await updateCurrentProfile({ settings: { ...currentProfile.settings, ...settings } });
  }, [currentProfile, updateCurrentProfile]);
  
  // Reset
  const resetAllData = useCallback(async () => {
    if (!user) return;
    const newData = await resetData(user.id);
    setData(newData);
  }, [user]);
  
  // Apply theme
  useEffect(() => {
    if (currentProfile) {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(currentProfile.settings.theme);
    }
  }, [currentProfile?.settings.theme]);

  const value: AppContextType = {
    data: data || null,
    currentProfile: currentProfile || null,
    dataLoading,
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

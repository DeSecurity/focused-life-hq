/**
 * Seed data generator for the Life PM application
 * Creates demo data for first-time users
 */

import { v4 as uuidv4 } from 'uuid';
import { Area, Idea, Profile, Project, Tag, Task } from './types';

const DEFAULT_AREAS: Omit<Area, 'id'>[] = [
  { name: 'Work & Career', description: 'Professional goals and tasks', color: 'area-work', icon: 'briefcase' },
  { name: 'Health & Fitness', description: 'Physical and mental wellness', color: 'area-health', icon: 'heart' },
  { name: 'Relationships', description: 'Family, friends, and social connections', color: 'area-relationships', icon: 'users' },
  { name: 'Learning', description: 'Education and skill development', color: 'area-learning', icon: 'book' },
  { name: 'Finances', description: 'Money management and investments', color: 'area-finances', icon: 'wallet' },
  { name: 'Home', description: 'Living space and environment', color: 'area-home', icon: 'home' },
  { name: 'Personal Growth', description: 'Self-improvement and habits', color: 'area-personal', icon: 'sparkles' },
];

const DEFAULT_TAGS: Omit<Tag, 'id'>[] = [
  { name: 'Deep Work', color: '#3b82f6' },
  { name: 'Errand', color: '#f59e0b' },
  { name: 'High Impact', color: '#ef4444' },
  { name: 'Low Energy', color: '#10b981' },
  { name: 'Quick Win', color: '#8b5cf6' },
];

export function createDefaultProfile(): Profile {
  const profileId = uuidv4();
  const now = new Date().toISOString();
  
  // Create areas with IDs
  const areas: Area[] = DEFAULT_AREAS.map(area => ({
    ...area,
    id: uuidv4(),
  }));
  
  // Create tags with IDs
  const tags: Tag[] = DEFAULT_TAGS.map(tag => ({
    ...tag,
    id: uuidv4(),
  }));
  
  // Get area IDs for demo projects
  const healthArea = areas.find(a => a.name.includes('Health'))!;
  const workArea = areas.find(a => a.name.includes('Work'))!;
  const homeArea = areas.find(a => a.name.includes('Home'))!;
  const learningArea = areas.find(a => a.name.includes('Learning'))!;
  
  // Get tag IDs
  const highImpactTag = tags.find(t => t.name === 'High Impact')!;
  const deepWorkTag = tags.find(t => t.name === 'Deep Work')!;
  const quickWinTag = tags.find(t => t.name === 'Quick Win')!;
  
  // Demo projects
  const projects: Project[] = [
    {
      id: uuidv4(),
      title: 'Build 3-Day Workout Routine',
      description: 'Design and test a sustainable workout routine that fits my schedule',
      areaId: healthArea.id,
      status: 'active',
      priority: 'high',
      tags: [highImpactTag.id],
      startDate: now,
      createdAt: now,
      updatedAt: now,
      isFocus: true,
    },
    {
      id: uuidv4(),
      title: 'Update Resume & LinkedIn',
      description: 'Refresh professional profiles with recent achievements and skills',
      areaId: workArea.id,
      status: 'active',
      priority: 'medium',
      tags: [deepWorkTag.id],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'Declutter Bedroom',
      description: 'Marie Kondo style cleanup and organization',
      areaId: homeArea.id,
      status: 'backlog',
      priority: 'low',
      tags: [quickWinTag.id],
      createdAt: now,
      updatedAt: now,
    },
  ];
  
  // Demo tasks
  const tasks: Task[] = [
    // Workout project tasks
    {
      id: uuidv4(),
      projectId: projects[0].id,
      title: 'Research workout split options',
      description: 'Look into push/pull/legs vs upper/lower splits',
      status: 'done',
      priority: 'medium',
      tags: [],
      createdAt: now,
      updatedAt: now,
      completedAt: now,
      checklistItems: [],
    },
    {
      id: uuidv4(),
      projectId: projects[0].id,
      title: 'Create Day 1 routine (Push)',
      description: 'Chest, shoulders, triceps exercises',
      status: 'in-progress',
      priority: 'high',
      tags: [],
      isToday: true,
      createdAt: now,
      updatedAt: now,
      checklistItems: [
        { id: uuidv4(), content: 'Choose chest exercises', done: true },
        { id: uuidv4(), content: 'Add shoulder exercises', done: false },
        { id: uuidv4(), content: 'Add tricep finishers', done: false },
      ],
    },
    {
      id: uuidv4(),
      projectId: projects[0].id,
      title: 'Create Day 2 routine (Pull)',
      status: 'todo',
      priority: 'high',
      tags: [],
      createdAt: now,
      updatedAt: now,
      checklistItems: [],
    },
    // Resume project tasks
    {
      id: uuidv4(),
      projectId: projects[1].id,
      title: 'List recent accomplishments',
      status: 'in-progress',
      priority: 'high',
      tags: [deepWorkTag.id],
      estimateMinutes: 60,
      createdAt: now,
      updatedAt: now,
      checklistItems: [],
    },
    {
      id: uuidv4(),
      projectId: projects[1].id,
      title: 'Update skills section',
      status: 'todo',
      priority: 'medium',
      tags: [],
      createdAt: now,
      updatedAt: now,
      checklistItems: [],
    },
    // Home project tasks
    {
      id: uuidv4(),
      projectId: projects[2].id,
      title: 'Sort through clothes',
      status: 'backlog',
      priority: 'low',
      tags: [quickWinTag.id],
      estimateMinutes: 120,
      createdAt: now,
      updatedAt: now,
      checklistItems: [],
    },
    // Standalone task
    {
      id: uuidv4(),
      title: 'Schedule dentist appointment',
      status: 'todo',
      priority: 'medium',
      tags: [],
      areaId: healthArea.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now,
      checklistItems: [],
    },
  ];
  
  // Demo ideas
  const ideas: Idea[] = [
    {
      id: uuidv4(),
      title: 'Learn a new programming language',
      notes: 'Maybe Rust or Go? Check job market demand.',
      areaId: learningArea.id,
      tags: [deepWorkTag.id],
      createdAt: now,
    },
    {
      id: uuidv4(),
      title: 'Start a side project podcast',
      notes: 'Interview people about their side projects and how they manage time',
      tags: [],
      createdAt: now,
    },
    {
      id: uuidv4(),
      title: 'Plan summer road trip',
      notes: 'National parks tour - Yellowstone, Grand Canyon, Zion',
      tags: [],
      createdAt: now,
    },
  ];
  
  return {
    id: profileId,
    name: 'My Life',
    createdAt: now,
    areas,
    projects,
    tasks,
    ideas,
    tags,
    settings: {
      theme: 'dark',
      defaultView: 'today',
      defaultTaskGrouping: 'project',
      hideCompletedTasks: false,
    },
  };
}

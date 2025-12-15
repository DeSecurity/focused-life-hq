/**
 * Storage layer for the Life PM application
 * Handles all localStorage operations with error handling
 */

import { AppData, Profile } from './types';
import { createDefaultProfile } from './seedData';

const STORAGE_KEY = 'lifePMData';
const CURRENT_PROFILE_KEY = 'lifePMCurrentProfile';
const APP_VERSION = '1.0.0';

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Load all app data from localStorage
 */
export function loadData(): AppData | null {
  try {
    if (!isStorageAvailable()) {
      console.error('localStorage is not available');
      return null;
    }
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    
    return JSON.parse(data) as AppData;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return null;
  }
}

/**
 * Save all app data to localStorage
 */
export function saveData(data: AppData): boolean {
  try {
    if (!isStorageAvailable()) {
      console.error('localStorage is not available');
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    return false;
  }
}

/**
 * Get the current profile ID from localStorage or cookie
 */
export function getCurrentProfileId(): string | null {
  try {
    return localStorage.getItem(CURRENT_PROFILE_KEY);
  } catch {
    return null;
  }
}

/**
 * Set the current profile ID
 */
export function setCurrentProfileId(profileId: string): void {
  try {
    localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
  } catch (error) {
    console.error('Error setting current profile ID:', error);
  }
}

/**
 * Initialize app data with default profile if none exists
 */
export function initializeData(): AppData {
  const existingData = loadData();
  
  if (existingData && existingData.profiles.length > 0) {
    // Ensure current profile exists
    const currentId = getCurrentProfileId();
    const profileExists = existingData.profiles.some(p => p.id === currentId);
    
    if (!profileExists) {
      setCurrentProfileId(existingData.profiles[0].id);
      existingData.currentProfileId = existingData.profiles[0].id;
    } else {
      existingData.currentProfileId = currentId!;
    }
    
    return existingData;
  }
  
  // Create new app data with default profile
  const defaultProfile = createDefaultProfile();
  const appData: AppData = {
    profiles: [defaultProfile],
    currentProfileId: defaultProfile.id,
    version: APP_VERSION,
  };
  
  saveData(appData);
  setCurrentProfileId(defaultProfile.id);
  
  return appData;
}

/**
 * Export data as JSON string for download
 */
export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string
 */
export function importData(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString) as AppData;
    
    // Basic validation
    if (!data.profiles || !Array.isArray(data.profiles)) {
      return { success: false, error: 'Invalid data format: missing profiles array' };
    }
    
    if (!data.currentProfileId) {
      data.currentProfileId = data.profiles[0]?.id || '';
    }
    
    saveData(data);
    setCurrentProfileId(data.currentProfileId);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Invalid JSON format' };
  }
}

/**
 * Clear all data and reinitialize with defaults
 */
export function resetData(): AppData {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
  
  return initializeData();
}

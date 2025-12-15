/**
 * Supabase storage layer for the Life PM application
 * Replaces localStorage with cloud storage
 */

import { AppData, Profile } from './types';
import { createDefaultProfile } from './seedData';
import { supabase } from './supabase';

const APP_VERSION = '1.0.0';

/**
 * Load all app data from Supabase for the current user
 */
export async function loadData(userId: string): Promise<AppData | null> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return null to initialize
        return null;
      }
      console.error('Error loading data from Supabase:', error);
      return null;
    }

    if (!data || !data.data) {
      return null;
    }

    return data.data as AppData;
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    return null;
  }
}

/**
 * Save all app data to Supabase
 */
export async function saveData(userId: string, data: AppData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data: data,
        version: APP_VERSION,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error saving data to Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving data to Supabase:', error);
    return false;
  }
}

/**
 * Get the current profile ID from user metadata
 */
export async function getCurrentProfileId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error || !data?.data) {
      return null;
    }

    return (data.data as AppData).currentProfileId || null;
  } catch (error) {
    console.error('Error getting current profile ID:', error);
    return null;
  }
}

/**
 * Set the current profile ID
 */
export async function setCurrentProfileId(userId: string, profileId: string): Promise<boolean> {
  try {
    const currentData = await loadData(userId);
    if (!currentData) {
      return false;
    }

    currentData.currentProfileId = profileId;
    return await saveData(userId, currentData);
  } catch (error) {
    console.error('Error setting current profile ID:', error);
    return false;
  }
}

/**
 * Initialize app data with default profile if none exists
 */
export async function initializeData(userId: string): Promise<AppData> {
  const existingData = await loadData(userId);

  if (existingData && existingData.profiles.length > 0) {
    // Ensure current profile exists
    const currentId = existingData.currentProfileId;
    const profileExists = existingData.profiles.some(p => p.id === currentId);

    if (!profileExists && existingData.profiles.length > 0) {
      existingData.currentProfileId = existingData.profiles[0].id;
      await saveData(userId, existingData);
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

  await saveData(userId, appData);

  return appData;
}

/**
 * Export data as JSON string for download
 */
export async function exportData(userId: string): Promise<string> {
  const data = await loadData(userId);
  if (!data) {
    return JSON.stringify({ profiles: [], currentProfileId: '', version: APP_VERSION }, null, 2);
  }
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string
 */
export async function importData(userId: string, jsonString: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = JSON.parse(jsonString) as AppData;

    // Basic validation
    if (!data.profiles || !Array.isArray(data.profiles)) {
      return { success: false, error: 'Invalid data format: missing profiles array' };
    }

    if (!data.currentProfileId) {
      data.currentProfileId = data.profiles[0]?.id || '';
    }

    const success = await saveData(userId, data);
    if (!success) {
      return { success: false, error: 'Failed to save imported data' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Invalid JSON format' };
  }
}

/**
 * Clear all data and reinitialize with defaults
 */
export async function resetData(userId: string): Promise<AppData> {
  try {
    const { error } = await supabase
      .from('user_data')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing user data:', error);
    }
  } catch (error) {
    console.error('Error clearing user data:', error);
  }

  return await initializeData(userId);
}


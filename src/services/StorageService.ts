import { SavedDetour } from '@/types/detour';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'DETOUR_SAVED_LIST';

/**
 * Save a detour to local storage
 */
export async function saveDetourLocal(detour: SavedDetour): Promise<SavedDetour> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: SavedDetour[] = raw ? JSON.parse(raw) : [];
    
    // Add new detour at the beginning (newest first)
    list.unshift(detour);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return detour;
  } catch (error) {
    console.error('Error saving detour:', error);
    throw new Error('Failed to save detour locally');
  }
}

/**
 * Get all saved detours
 */
export async function listDetoursLocal(): Promise<SavedDetour[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error listing detours:', error);
    return [];
  }
}

/**
 * Get a single detour by ID
 */
export async function getDetourById(id: string): Promise<SavedDetour | null> {
  try {
    const list = await listDetoursLocal();
    return list.find(d => d.id === id) || null;
  } catch (error) {
    console.error('Error getting detour:', error);
    return null;
  }
}

/**
 * Delete a detour by ID
 */
export async function removeDetourLocal(id: string): Promise<SavedDetour[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: SavedDetour[] = raw ? JSON.parse(raw) : [];
    
    const filtered = list.filter(d => d.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error removing detour:', error);
    throw new Error('Failed to delete detour');
  }
}

/**
 * Update a detour's status
 */
export async function updateDetourStatus(
  id: string,
  status: 'planned' | 'completed'
): Promise<SavedDetour | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: SavedDetour[] = raw ? JSON.parse(raw) : [];
    
    const index = list.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    list[index].status = status;
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list[index];
  } catch (error) {
    console.error('Error updating detour status:', error);
    throw new Error('Failed to update detour status');
  }
}

/**
 * Clear all saved detours (for testing/debugging)
 */
export async function clearAllDetours(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing detours:', error);
    throw new Error('Failed to clear detours');
  }
}

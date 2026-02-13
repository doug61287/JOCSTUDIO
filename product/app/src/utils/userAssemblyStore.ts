/**
 * User Assembly Store
 * Persists user-created assemblies to localStorage
 */

import type { Assembly } from '../types';

const STORAGE_KEY = 'jochero-user-assemblies';

/**
 * Get all user-created assemblies from localStorage
 */
export function getUserAssemblies(): Assembly[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load user assemblies:', e);
    return [];
  }
}

/**
 * Save a new assembly to user storage
 */
export function saveUserAssembly(assembly: Assembly): void {
  const existing = getUserAssemblies();
  
  // Check for duplicate ID
  const existingIndex = existing.findIndex(a => a.id === assembly.id);
  if (existingIndex >= 0) {
    // Update existing
    existing[existingIndex] = assembly;
  } else {
    // Add new
    existing.push(assembly);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/**
 * Delete a user assembly by ID
 */
export function deleteUserAssembly(assemblyId: string): void {
  const existing = getUserAssemblies();
  const filtered = existing.filter(a => a.id !== assemblyId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Generate a unique assembly ID
 */
export function generateAssemblyId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export user assemblies as JSON (for backup/sharing)
 */
export function exportUserAssemblies(): string {
  return JSON.stringify(getUserAssemblies(), null, 2);
}

/**
 * Import assemblies from JSON
 */
export function importUserAssemblies(json: string): number {
  try {
    const assemblies = JSON.parse(json) as Assembly[];
    const existing = getUserAssemblies();
    
    let imported = 0;
    for (const assembly of assemblies) {
      // Generate new ID to avoid conflicts
      const newAssembly = {
        ...assembly,
        id: generateAssemblyId(),
        createdBy: 'user' as const,
      };
      existing.push(newAssembly);
      imported++;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return imported;
  } catch (e) {
    console.error('Failed to import assemblies:', e);
    return 0;
  }
}

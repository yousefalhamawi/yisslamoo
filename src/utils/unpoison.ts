
/**
 * Robust utility to clean data that might have been poisoned (double-stringified,
 * character-indexed objects, or corrupted JSON strings).
 */
export function unpoison(data: any): any {
  if (data === null || data === undefined) return data;

  // 1. Handle strings (might be stringified JSON)
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        // Only recurse if parsing actually changed something to avoid infinite loops
        if (parsed !== data) return unpoison(parsed);
      } catch (e) {
        return data;
      }
    }
    return data;
  }

  // 2. Handle character-indexed objects (poisoned strings or arrays)
  // These look like { "0": "a", "1": "b", ... }
  if (typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data);
    // If it looks like a poisoned structure (all keys are numeric)
    if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
      const sortedKeys = keys.map(Number).sort((a, b) => a - b);
      // Contiguous sequence check from 0
      if (sortedKeys[0] === 0 && sortedKeys[sortedKeys.length - 1] === sortedKeys.length - 1) {
        const values = sortedKeys.map(k => (data as any)[k]);
        
        // Check if it's a poisoned string (all values are single characters)
        const isPoisonedString = values.every(v => typeof v === 'string' && v.length === 1);
        
        if (isPoisonedString) {
          const str = values.join('');
          try {
            const parsed = JSON.parse(str);
            return unpoison(parsed);
          } catch (e) {
            return unpoison(str);
          }
        } else {
          // It's a poisoned array
          return unpoison(values);
        }
      }
    }
    
    // Clean nested properties
    const cleaned: any = {};
    let changed = false;
    for (const key in data) {
      const val = unpoison(data[key]);
      cleaned[key] = val;
      if (val !== data[key]) changed = true;
    }
    return changed ? cleaned : data;
  }

  // 3. Handle arrays
  if (Array.isArray(data)) {
    // Special case: Array containing a single poisoned object
    if (data.length === 1 && typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])) {
      const unpoisonedFirst = unpoison(data[0]);
      if (unpoisonedFirst !== data[0]) return unpoisonedFirst;
    }
    
    let changed = false;
    const cleaned = data.map(item => {
      const val = unpoison(item);
      if (val !== item) changed = true;
      return val;
    });
    return changed ? cleaned : data;
  }

  return data;
}

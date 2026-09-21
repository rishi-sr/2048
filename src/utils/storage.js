// Safe LocalStorage Utility with in-memory fallback

const BEST_SCORE_KEY = '2048_desert_best_score';
const GAME_STATE_KEY = '2048_desert_saved_state';

let memoryStorage = {};

const isStorageAvailable = () => {
  try {
    const testKey = '__test_storage__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const hasLocalStorage = typeof window !== 'undefined' && isStorageAvailable();

export const getSavedBestScore = () => {
  try {
    if (hasLocalStorage) {
      const stored = window.localStorage.getItem(BEST_SCORE_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    }
    return memoryStorage[BEST_SCORE_KEY] || 0;
  } catch (e) {
    console.warn('Could not read best score from localStorage:', e);
    return memoryStorage[BEST_SCORE_KEY] || 0;
  }
};

export const saveBestScore = (score) => {
  try {
    if (hasLocalStorage) {
      window.localStorage.setItem(BEST_SCORE_KEY, score.toString());
    }
    memoryStorage[BEST_SCORE_KEY] = score;
  } catch (e) {
    console.warn('Could not save best score to localStorage:', e);
    memoryStorage[BEST_SCORE_KEY] = score;
  }
};

export const getSavedGameState = () => {
  try {
    if (hasLocalStorage) {
      const stateStr = window.localStorage.getItem(GAME_STATE_KEY);
      return stateStr ? JSON.parse(stateStr) : null;
    }
    return memoryStorage[GAME_STATE_KEY] || null;
  } catch {
    return null;
  }
};

export const saveGameState = (state) => {
  try {
    const json = JSON.stringify(state);
    if (hasLocalStorage) {
      window.localStorage.setItem(GAME_STATE_KEY, json);
    }
    memoryStorage[GAME_STATE_KEY] = state;
  } catch {
    // Ignore storage quota/serialization errors
  }
};

export const clearSavedGameState = () => {
  try {
    if (hasLocalStorage) {
      window.localStorage.removeItem(GAME_STATE_KEY);
    }
    delete memoryStorage[GAME_STATE_KEY];
  } catch {
    // Ignore
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@timeline_notes_entries';
const EVENTS_STORAGE_KEY = '@timeline_events';

export const loadEntries = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load entries", e);
    return [];
  }
};

export const saveEntries = async (entries) => {
  try {
    const jsonValue = JSON.stringify(entries);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save entries", e);
  }
};

export const loadEvents = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load events", e);
    return [];
  }
};

export const saveEvents = async (events) => {
  try {
    const jsonValue = JSON.stringify(events);
    await AsyncStorage.setItem(EVENTS_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save events", e);
  }
};

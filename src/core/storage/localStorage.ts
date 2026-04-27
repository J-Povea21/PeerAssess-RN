import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorage {
  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export default new LocalStorage();
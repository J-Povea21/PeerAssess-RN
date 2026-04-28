<<<<<<< HEAD
/* eslint-disable no-console */
=======
>>>>>>> cde6f88 ([86b9kxbb1]: add bootstrap tooling and core infrastructure)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ILocalPreferences } from "./iLocalPreferences";

export class LocalPreferencesAsyncStorage
  implements ILocalPreferences
{
  private static instance:
    LocalPreferencesAsyncStorage;

  private constructor() {}

  static getInstance(): LocalPreferencesAsyncStorage {
    if (
      !LocalPreferencesAsyncStorage.instance
    ) {
      LocalPreferencesAsyncStorage.instance =
        new LocalPreferencesAsyncStorage();
    }

    return LocalPreferencesAsyncStorage.instance;
  }

  async storeData<T>(
    key: string,
    value: T
  ): Promise<void> {
    try {
      const jsonValue =
        JSON.stringify(value);

<<<<<<< HEAD
    async storeData<T>(key: string, value: T): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            if (__DEV__) console.error(`Error storing data for ${key}`, e);
        }
    }
    async retrieveData<T>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue ? JSON.parse(jsonValue) : null;
        } catch (e) {
            if (__DEV__) console.error(`Error retrieving data for ${key}`, e);
            return null;
        }
    }
    async removeData(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            if (__DEV__) console.error(`Error removing data for ${key}`, e);
        }
    }
    async storeEntry<T>(key: string, entry: T): Promise<void> {
        try {
            const existing = await AsyncStorage.getItem(key);
            const data: T[] = existing ? JSON.parse(existing) : [];
            data.push(entry);
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            if (__DEV__) console.error(`Error storing entry for ${key}`, e);
        }
    }
    async getAllEntries<T>(key: string): Promise<T[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue ? JSON.parse(jsonValue) : [];
        } catch (e) {
            if (__DEV__) console.error(`Error reading entries for ${key}`, e);
            return [];
        }
    }
    async replaceEntries<T>(key: string, entries: T[]): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(entries));
        } catch (e) {
            if (__DEV__) console.error(`Error replacing entries for ${key}`, e);
        }
    }
    async clearAll(): Promise<void> {
        await AsyncStorage.clear();
=======
      await AsyncStorage.setItem(
        key,
        jsonValue
      );
    } catch {
      return;
>>>>>>> cde6f88 ([86b9kxbb1]: add bootstrap tooling and core infrastructure)
    }
  }

  async retrieveData<T>(
    key: string
  ): Promise<T | null> {
    try {
      const jsonValue =
        await AsyncStorage.getItem(key);

      return jsonValue
        ? JSON.parse(jsonValue)
        : null;
    } catch {
      return null;
    }
  }

  async removeData(
    key: string
  ): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      return;
    }
  }

  async storeEntry<T>(
    key: string,
    entry: T
  ): Promise<void> {
    try {
      const existing =
        await AsyncStorage.getItem(key);

      const data: T[] = existing
        ? JSON.parse(existing)
        : [];

      data.push(entry);

      await AsyncStorage.setItem(
        key,
        JSON.stringify(data)
      );
    } catch {
      return;
    }
  }

  async getAllEntries<T>(
    key: string
  ): Promise<T[]> {
    try {
      const jsonValue =
        await AsyncStorage.getItem(key);

      return jsonValue
        ? JSON.parse(jsonValue)
        : [];
    } catch {
      return [];
    }
  }

  async replaceEntries<T>(
    key: string,
    entries: T[]
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        key,
        JSON.stringify(entries)
      );
    } catch {
      return;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch {
      return;
    }
  }
}
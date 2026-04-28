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

      await AsyncStorage.setItem(
        key,
        jsonValue
      );
    } catch {
      return;
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
// Web mock for react-native-mmkv using localStorage
const createMMKV = () => ({
  getString: (key: string): string | undefined =>
    localStorage.getItem(key) ?? undefined,
  set: (key: string, value: string | number | boolean) =>
    localStorage.setItem(key, String(value)),
  delete: (key: string) => localStorage.removeItem(key),
  contains: (key: string) => localStorage.getItem(key) !== null,
  getAllKeys: (): string[] => Object.keys(localStorage),
});

export { createMMKV };

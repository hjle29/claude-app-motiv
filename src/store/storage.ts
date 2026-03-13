import { createMMKV } from 'react-native-mmkv';

// Separate instance from the theme storage in App.tsx
export const appStorage = createMMKV({ id: 'app-data' });

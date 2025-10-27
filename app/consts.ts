import { Platform } from 'react-native';

export const now = Math.floor(Date.now() / 1000); //unit is seconds
export const isWeb = Platform.OS === 'web';
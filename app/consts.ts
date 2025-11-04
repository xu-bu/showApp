import { Platform } from 'react-native';

export const now = Math.floor(Date.now() / 1000); //unit is seconds
export const isWeb = Platform.OS === 'web';
export const EXPO_PUBLIC_API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
import { AsyncStorage } from '../firebase/firebaseConfig';

export const LOCAL_USER_DATA_KEYS = [
  'medha_user',
  'medha_booster_cart_v1',
  'medha_pending_phone_verification',
  'medha_health_alert_plan',
  'medha_health_alert_last_user',
  'medha_health_alert_notification_preference',
];

export async function clearLocalUserData() {
  const keys = await AsyncStorage.getAllKeys();
  const userScopedKeys = keys.filter(key =>
    LOCAL_USER_DATA_KEYS.some(
      baseKey => key === baseKey || key.startsWith(`${baseKey}:`)
    )
  );

  if (userScopedKeys.length > 0) {
    await AsyncStorage.multiRemove(userScopedKeys);
  }
}

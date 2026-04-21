import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { AsyncStorage } from '../firebase/firebaseConfig';
import type { PersonalizedDietPlan } from './personalizedDiet';

const HEALTH_ALERT_STORAGE_PREFIX = 'medha_health_alert_plan';
const HEALTH_ALERT_NOTIFICATION_PREFERENCE_PREFIX =
  'medha_health_alert_notification_preference';
export const HEALTH_REMINDER_CHANNEL_ID = 'health-reminders';

type ReminderTime = {
  hour: number;
  minute: number;
};

const DEFAULT_REMINDER_TIMES: ReminderTime[] = [
  { hour: 8, minute: 0 },
  { hour: 13, minute: 0 },
  { hour: 16, minute: 30 },
  { hour: 19, minute: 0 },
  { hour: 21, minute: 0 },
];

export type AcceptedHealthAlertPlan = {
  acceptedAt: string;
  plan: PersonalizedDietPlan;
};

function getStorageKey(userId?: string | null) {
  const normalizedUserId = userId?.trim() || 'default';
  return `${HEALTH_ALERT_STORAGE_PREFIX}:${normalizedUserId}`;
}

function getNotificationPreferenceKey(userId?: string | null) {
  const normalizedUserId = userId?.trim() || 'default';
  return `${HEALTH_ALERT_NOTIFICATION_PREFERENCE_PREFIX}:${normalizedUserId}`;
}

function isMealCard(
  value: unknown
): value is PersonalizedDietPlan['mealCards'][number] {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.name === 'string' &&
    typeof record.time === 'string' &&
    Array.isArray(record.foods) &&
    record.foods.every(item => typeof item === 'string')
  );
}

function isSupportCard(
  value: unknown
): value is PersonalizedDietPlan['supportCards'][number] {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.title === 'string' &&
    typeof record.description === 'string' &&
    Array.isArray(record.bullets) &&
    record.bullets.every(item => typeof item === 'string')
  );
}

function isPersonalizedDietPlan(value: unknown): value is PersonalizedDietPlan {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  const hydration = record.hydration as Record<string, unknown> | undefined;
  const avoid = record.avoid as Record<string, unknown> | undefined;
  const improvementTimeline = record.improvementTimeline as
    | Record<string, unknown>
    | undefined;

  return (
    typeof record.title === 'string' &&
    typeof record.subtitle === 'string' &&
    typeof record.intro === 'string' &&
    typeof record.focusSummary === 'string' &&
    typeof record.caution === 'string' &&
    typeof record.acceptLabel === 'string' &&
    Array.isArray(record.mealCards) &&
    record.mealCards.every(isMealCard) &&
    hydration !== undefined &&
    typeof hydration.target === 'string' &&
    Array.isArray(hydration.tips) &&
    hydration.tips.every(item => typeof item === 'string') &&
    avoid !== undefined &&
    typeof avoid.title === 'string' &&
    Array.isArray(avoid.items) &&
    avoid.items.every(item => typeof item === 'string') &&
    improvementTimeline !== undefined &&
    typeof improvementTimeline.title === 'string' &&
    Array.isArray(improvementTimeline.phases) &&
    Array.isArray(record.supportCards) &&
    record.supportCards.every(isSupportCard)
  );
}

export async function saveAcceptedHealthAlertPlan(
  plan: PersonalizedDietPlan,
  userId?: string | null
) {
  const payload: AcceptedHealthAlertPlan = {
    acceptedAt: new Date().toISOString(),
    plan,
  };

  await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(payload));
}

export async function getAcceptedHealthAlertPlan(userId?: string | null) {
  try {
    const rawValue = await AsyncStorage.getItem(getStorageKey(userId));

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return null;
    }

    const parsed = parsedValue as Record<string, unknown>;

    if (
      typeof parsed.acceptedAt !== 'string' ||
      !isPersonalizedDietPlan(parsed.plan)
    ) {
      return null;
    }

    return {
      acceptedAt: parsed.acceptedAt,
      plan: parsed.plan,
    } satisfies AcceptedHealthAlertPlan;
  } catch (error) {
    console.log('Health alert plan read error:', error);
    return null;
  }
}

export async function prepareHealthAlertNotifications(promptForPermission = false) {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(HEALTH_REMINDER_CHANNEL_ID, {
        name: 'Wellness Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    const settings = await Notifications.getPermissionsAsync();
    let finalStatus = settings.status;

    if (promptForPermission && finalStatus !== 'granted') {
      const request = await Notifications.requestPermissionsAsync();
      finalStatus = request.status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.log('Notification setup error:', error);
    return false;
  }
}

export async function getHealthAlertNotificationPreference(userId?: string | null) {
  try {
    const rawValue = await AsyncStorage.getItem(getNotificationPreferenceKey(userId));

    if (rawValue === 'true') {
      return true;
    }

    if (rawValue === 'false') {
      return false;
    }

    return null;
  } catch (error) {
    console.log('Health alert notification preference read error:', error);
    return null;
  }
}

export async function saveHealthAlertNotificationPreference(
  enabled: boolean,
  userId?: string | null
) {
  try {
    await AsyncStorage.setItem(
      getNotificationPreferenceKey(userId),
      enabled ? 'true' : 'false'
    );
  } catch (error) {
    console.log('Health alert notification preference write error:', error);
  }
}

function normalizeTimeLabel(value: string) {
  return value.replace(/\./g, '').replace(/\s+/g, ' ').trim().toUpperCase();
}

function to24Hour(hour: number, minute: number, meridiem?: string | null) {
  if (meridiem === 'AM') {
    return {
      hour: hour === 12 ? 0 : hour,
      minute,
    };
  }

  if (meridiem === 'PM') {
    return {
      hour: hour === 12 ? 12 : hour + 12,
      minute,
    };
  }

  if (hour >= 0 && hour <= 23) {
    return {
      hour,
      minute,
    };
  }

  return null;
}

export function getMealReminderTime(
  mealName: string,
  timeLabel: string,
  index: number
) {
  const normalizedTime = normalizeTimeLabel(timeLabel);
  const timeMatch = normalizedTime.match(/(\d{1,2})(?::(\d{2}))?/);
  const meridiemMatch = normalizedTime.match(/\b(AM|PM)\b/);

  if (timeMatch) {
    const parsedHour = Number.parseInt(timeMatch[1] ?? '', 10);
    const parsedMinute = Number.parseInt(timeMatch[2] ?? '0', 10);

    if (
      Number.isFinite(parsedHour) &&
      Number.isFinite(parsedMinute) &&
      parsedMinute >= 0 &&
      parsedMinute <= 59
    ) {
      const converted = to24Hour(parsedHour, parsedMinute, meridiemMatch?.[1] ?? null);

      if (converted) {
        return converted;
      }
    }
  }

  const normalizedMealName = mealName.trim().toLowerCase();

  if (normalizedMealName.includes('breakfast') || normalizedMealName.includes('morning')) {
    return { hour: 8, minute: 0 };
  }

  if (normalizedMealName.includes('lunch') || normalizedMealName.includes('noon')) {
    return { hour: 13, minute: 0 };
  }

  if (
    normalizedMealName.includes('dinner') ||
    normalizedMealName.includes('supper') ||
    normalizedMealName.includes('evening')
  ) {
    return { hour: 21, minute: 0 };
  }

  return (
    DEFAULT_REMINDER_TIMES[index] ??
    DEFAULT_REMINDER_TIMES[DEFAULT_REMINDER_TIMES.length - 1]!
  );
}

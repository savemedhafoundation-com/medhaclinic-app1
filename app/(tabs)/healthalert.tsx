import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import { useAuth } from '../../providers/AuthProvider';
import {
  type AcceptedHealthAlertPlan,
  getAcceptedHealthAlertPlan,
  getHealthAlertNotificationPreference,
  getMealReminderTime,
  HEALTH_REMINDER_CHANNEL_ID,
  prepareHealthAlertNotifications,
  saveHealthAlertNotificationPreference,
} from '../../services/healthAlerts';

type MealCardProps = {
  title: string;
  time: string;
  foods: string[];
  note: string | null;
  boosterTip: string | null;
  notificationsEnabled: boolean;
  onSetAlarm: () => void;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function formatAcceptedDate(value: string) {
  const acceptedDate = new Date(value);

  if (Number.isNaN(acceptedDate.getTime())) {
    return 'Recently accepted';
  }

  return acceptedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MealCard({
  title,
  time,
  foods,
  note,
  boosterTip,
  notificationsEnabled,
  onSetAlarm,
}: MealCardProps) {
  const detailLines = [boosterTip, note].filter(
    (value): value is string => Boolean(value?.trim())
  );

  return (
    <View className="mb-5 rounded-2xl bg-green-100 p-5">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-xl font-bold text-black">{title}</Text>
          <Text className="mt-1 text-gray-800">{time}</Text>
        </View>

        <Text className="font-semibold text-gray-700">
          {notificationsEnabled ? 'Reminder ready' : 'Notification off'}
        </Text>
      </View>

      <Text className="mt-4 text-gray-800">{foods.join(' | ')}</Text>

      {detailLines.map(line => (
        <Text className="mt-2 text-gray-700" key={line}>
          {line}
        </Text>
      ))}

      <TouchableOpacity
        className="mt-4 items-center rounded-full bg-green-500 py-2"
        onPress={onSetAlarm}
      >
        <Text className="font-semibold text-white">Set Daily Alarm</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HealthAlertsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [acceptedPlan, setAcceptedPlan] = useState<AcceptedHealthAlertPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadScreenState() {
      try {
        const [storedPlan, permissionGranted, savedPreference] = await Promise.all([
          getAcceptedHealthAlertPlan(user?.uid),
          prepareHealthAlertNotifications(false),
          getHealthAlertNotificationPreference(user?.uid),
        ]);

        if (!active) {
          return;
        }

        setAcceptedPlan(storedPlan);
        setNotificationsEnabled((savedPreference ?? permissionGranted) && permissionGranted);
      } catch (error) {
        console.log('Health alert screen load error:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadScreenState();

    return () => {
      active = false;
    };
  }, [user?.uid]);

  async function ensureNotificationsEnabled() {
    if (notificationsEnabled) {
      return true;
    }

    const granted = await prepareHealthAlertNotifications(true);
    setNotificationsEnabled(granted);
    await saveHealthAlertNotificationPreference(granted, user?.uid);

    if (!granted) {
      Alert.alert(
        'Permission required',
        'Please allow notifications to use alarms and reminders.'
      );
      return false;
    }

    return true;
  }

  async function handleNotificationToggle(nextValue: boolean) {
    if (!nextValue) {
      setNotificationsEnabled(false);
      await saveHealthAlertNotificationPreference(false, user?.uid);

      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch (error) {
        console.log('Cancel scheduled notifications error:', error);
      }

      return;
    }

    const granted = await prepareHealthAlertNotifications(true);
    setNotificationsEnabled(granted);
    await saveHealthAlertNotificationPreference(granted, user?.uid);

    if (!granted) {
      Alert.alert(
        'Permission required',
        'Please allow notifications to use alarms and reminders.'
      );
    }
  }

  async function cancelAllAlarms() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('Cancelled', 'All scheduled reminders have been removed.');
    } catch (error) {
      console.log('Cancel error:', error);
    }
  }

  async function scheduleDailyMealAlarm(
    title: string,
    timeLabel: string,
    index: number,
    reminderNote?: string | null
  ) {
    try {
      const enabled = await ensureNotificationsEnabled();

      if (!enabled) {
        return;
      }

      const reminderTime = getMealReminderTime(title, timeLabel, index);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Health Booster Reminder',
          body:
            reminderNote?.trim() ||
            `Time for ${title}. Please follow your accepted health plan.`,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminderTime.hour,
          minute: reminderTime.minute,
          channelId:
            Platform.OS === 'android' ? HEALTH_REMINDER_CHANNEL_ID : undefined,
        },
      });

      Alert.alert('Alarm set', `${title} reminder scheduled successfully.`);
    } catch (error) {
      console.log('Meal alarm error:', error);
      Alert.alert('Error', `Could not schedule ${title} reminder.`);
    }
  }

  async function scheduleWaterAlarm() {
    try {
      const enabled = await ensureNotificationsEnabled();

      if (!enabled) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hydration Reminder',
          body: 'Please drink water and follow your daily hydration target.',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60 * 60,
          repeats: true,
          channelId:
            Platform.OS === 'android' ? HEALTH_REMINDER_CHANNEL_ID : undefined,
        },
      });

      Alert.alert('Water alarm set', 'You will receive reminders every hour.');
    } catch (error) {
      console.log('Water alarm error:', error);
      Alert.alert('Error', 'Could not schedule water reminder.');
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator color="#16a34a" size="large" />
        <Text className="mt-4 text-base font-semibold text-green-700">
          Loading health alerts...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-100"
      edges={['left', 'right', 'bottom']}
    >
      <ScreenNav />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
          paddingBottom: 220,
        }}
      >
        <Text className="text-center text-3xl font-bold text-green-700">
          Health Alerts
        </Text>

        <Text className="mt-3 text-center text-gray-700">
          {acceptedPlan?.plan.focusSummary ??
            'Accept your personalized diet plan to load meal reminders and hydration guidance here.'}
        </Text>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-green-700">
            Notification alerts enabled
          </Text>

          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#ccc', true: '#16a34a' }}
            thumbColor="#fff"
          />
        </View>

        {!acceptedPlan ? (
          <View className="mt-6 rounded-2xl bg-white p-5">
            <Text className="text-2xl font-bold text-green-700">No accepted plan yet</Text>
            <Text className="mt-3 text-gray-700">
              Tap your personalized diet plan&apos;s &quot;I understand and
              accept&quot; button first. That saves the full meal and hydration
              data here.
            </Text>

            <TouchableOpacity
              className="mt-5 items-center rounded-full bg-green-500 py-3"
              onPress={() => router.push('/boosterdiet/dietplan')}
            >
              <Text className="font-semibold text-white">Open Diet Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="mt-6 rounded-2xl bg-white p-5">
              <Text className="text-lg font-semibold text-green-700">
                Accepted on {formatAcceptedDate(acceptedPlan.acceptedAt)}
              </Text>
              <Text className="mt-2 text-gray-700">{acceptedPlan.plan.subtitle}</Text>
            </View>

            <View className="mt-6">
              {acceptedPlan.plan.mealCards.map((meal, index) => (
                <MealCard
                  boosterTip={meal.boosterTip}
                  foods={meal.foods}
                  key={`${meal.name}-${meal.time}-${index}`}
                  note={meal.note}
                  notificationsEnabled={notificationsEnabled}
                  onSetAlarm={() =>
                    scheduleDailyMealAlarm(
                      meal.name,
                      meal.time,
                      index,
                      meal.boosterTip ?? meal.note
                    )
                  }
                  time={meal.time}
                  title={meal.name}
                />
              ))}
            </View>

            <View className="mb-8 mt-3 rounded-2xl bg-green-100 p-5">
              <Text className="text-2xl font-bold">Water Reminder</Text>

              <Text className="mt-2 text-lg">{acceptedPlan.plan.hydration.target}</Text>

              {acceptedPlan.plan.hydration.tips.map(tip => (
                <Text className="mt-2 text-gray-700" key={tip}>
                  {tip}
                </Text>
              ))}

              <TouchableOpacity
                className="mt-4 items-center rounded-full bg-green-500 py-2"
                onPress={scheduleWaterAlarm}
              >
                <Text className="font-semibold text-white">Start Water Alarm</Text>
              </TouchableOpacity>

              <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
                {['180 ml', '250 ml', '350 ml', '500 ml'].map(item => (
                  <TouchableOpacity
                    key={item}
                    className="rounded-full bg-green-400 px-4 py-2"
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <TouchableOpacity
          className="mb-6 items-center rounded-full bg-red-500 py-3"
          onPress={cancelAllAlarms}
        >
          <Text className="font-semibold text-white">Cancel All Alarms</Text>
        </TouchableOpacity>

        <Text className="mb-3 text-center text-gray-800">
          Your accepted plan stays saved for future health alerts.
        </Text>

        <Text className="mb-16 text-center text-gray-700">
          Alerts stay private on your device and are used only for your health guidance.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

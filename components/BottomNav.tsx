import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/* 🔹 Map routes → tabs correctly */
function getActiveTab(pathname: string) {
  if (pathname.startsWith('/(tabs)/dashboard')) return 'dashboard';
  if (pathname.startsWith('/(tabs)/healthalert')) return 'healthalert';
  if (pathname.startsWith('/(tabs)/profile')) return 'profile';
  return '';
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  const tabs = [
    { key: 'dashboard', icon: 'home', route: '/(tabs)/dashboard' },
    { key: 'healthalert', icon: 'stats-chart', route: '/(tabs)/healthalert' },
    { key: 'profile', icon: 'person', route: '/(tabs)/profile' },
  ];

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 70,
        width: '100%',
        alignItems: 'center',
        zIndex: 20,
      }}
    >
      <LinearGradient
        colors={['#16a34a', '#22c55e', '#4ade80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: '92%',
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 999,
          flexDirection: 'row',
          justifyContent: 'space-between',
          elevation: 12,
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => router.replace(tab.route)}
              activeOpacity={0.85}
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={24}
                color={isActive ? '#252d29' : '#eaffea'}
              />
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}
